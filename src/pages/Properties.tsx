// pages/Properties.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import InteractiveMap from "@/components/InteractiveMap";
import { MessagesModal } from "@/components/MessagesModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { API_BASE, LOCAL_STORAGE_USER_KEY } from "../constants";

interface ApiListing {
  _id?: string;
  rent?: number;
  address?: string;
  title?: string;
  capacity?: number;
  images?: string[];
  description?: string;
  owner?: string;
  securityDeposit?: number;
  startDate?: string;
  endDate?: string;
}

interface Property {
  id: string;
  ownerId?: string;
  image: string;
  price: number;
  title: string;
  address: string;
  availableFrom?: string;
  availableTo?: string;
  roommates: number;
  distance: number;
  amenities: string[];
  securityDeposit?: number;
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Properties = () => {
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxRoommates, setMaxRoommates] = useState(10);
  const [maxDistance, setMaxDistance] = useState(10);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set()
  );
  const [properties, setProperties] = useState<Property[]>([]);

  // messaging modal state
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagePeerId, setMessagePeerId] = useState<string | undefined>(
    undefined
  );

  // agreement modal state
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [agreementListing, setAgreementListing] = useState<Property | null>(
    null
  );
  const [agreementSubmitting, setAgreementSubmitting] = useState(false);
  const [agreementForm, setAgreementForm] = useState({
    startDate: "",
    endDate: "",
    rent: "",
    securityDeposit: "",
    numPeople: "1",
    payTerm: "monthly",
  });

  const currentUser = getCurrentUser();
  const currentUserId: string | null = currentUser?._id ?? null;

  // Load listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_BASE}/listings`);
        if (!res.ok) {
          console.error("Failed to load listings", await res.text());
          return;
        }
        const apiListings: ApiListing[] = await res.json();

        const normalized: Property[] = apiListings.map((l) => ({
          id: (l._id || "").toString(),
          ownerId: l.owner ? l.owner.toString() : undefined,
          image:
            "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&h=600&fit=crop",
          price: l.rent ?? 0,
          title: l.title || l.address || "Sublease",
          address: l.address || "Madison, WI",
          availableFrom: l.startDate,
          availableTo: l.endDate,
          roommates: l.capacity ?? 0,
          distance: 0,
          amenities: [],
          securityDeposit: l.securityDeposit,
        }));

        setProperties(normalized);
      } catch (err) {
        console.error("Error loading listings", err);
      }
    };

    fetchListings();
  }, []);

  // Load saved listings for current user
  useEffect(() => {
    const loadSaved = async () => {
      if (!currentUserId) return;

      try {
        const res = await fetch(`${API_BASE}/listings/saved/${currentUserId}`);
        if (!res.ok) {
          console.error("Failed to load saved listings");
          return;
        }

        const savedListings = await res.json(); // array of listing objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const savedIds = savedListings.map((l: any) => String(l._id));
        setSavedProperties(new Set(savedIds));
      } catch (err) {
        console.error("Error loading saved listings", err);
      }
    };

    loadSaved();
  }, [currentUserId]);

  const handleSaveProperty = async (id: string | number) => {
    if (!currentUserId) {
      navigate("/auth");
      return;
    }

    const listingId = String(id);
    const isSaved = savedProperties.has(listingId);

    // Optimistic UI update
    setSavedProperties((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    try {
      if (!isSaved) {
        // SAVE (POST)
        await fetch(`${API_BASE}/listings/${listingId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        });
      } else {
        // UNSAVE (DELETE)
        await fetch(`${API_BASE}/listings/${listingId}/save`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        });
      }
    } catch (err) {
      console.error("Failed to toggle saved listing", err);

      // revert optimistic update
      setSavedProperties((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
    }
  };

  const handleMessageOwner = (ownerId: string) => {
    if (!currentUserId) {
      navigate("/auth");
      return;
    }
    setMessagePeerId(ownerId);
    setMessagesOpen(true);
  };

  // open agreement modal for a specific listing
  const handleStartAgreement = (property: Property) => {
    if (!currentUserId) {
      navigate("/auth");
      return;
    }
    // don’t allow owners to make agreements with themselves
    if (property.ownerId && property.ownerId === currentUserId) {
      alert("You are the owner for this listing.");
      return;
    }

    setAgreementListing(property);
    setAgreementForm({
      startDate: "",
      endDate: "",
      rent: property.price ? String(property.price) : "",
      securityDeposit: property.securityDeposit
        ? String(property.securityDeposit)
        : "",
      numPeople: property.roommates ? String(property.roommates) : "1",
      payTerm: "monthly",
    });
    setAgreementOpen(true);
  };

  const handleCreateAgreement = async () => {
    if (!currentUserId || !agreementListing) return;

    const listingId = agreementListing.id;
    const ownerId = agreementListing.ownerId;
    if (!ownerId) {
      alert("Listing owner is missing.");
      return;
    }

    if (!agreementForm.startDate || !agreementForm.endDate) {
      alert("Please provide start and end dates.");
      return;
    }

    if (!agreementForm.numPeople) {
      alert("Please provide number of people.");
      return;
    }

    setAgreementSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE}/listings/${listingId}/makeAgreement`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: agreementForm.startDate,
            endDate: agreementForm.endDate,
            tenant: currentUserId,
            owner: ownerId,
            payTerm: agreementForm.payTerm || "monthly",
            rent: agreementForm.rent
              ? Number(agreementForm.rent)
              : agreementListing.price,
            securityDeposit: agreementForm.securityDeposit
              ? Number(agreementForm.securityDeposit)
              : undefined,
            numPeople: Number(agreementForm.numPeople),
          }),
        }
      );

      if (!res.ok) {
        console.error("Failed to create agreement", await res.text());
        alert("Failed to create agreement. Please check your inputs.");
        return;
      }

      // we don’t need the response here for now – dashboard will pick it up via GET /agreements
      await res.json();

      alert("Agreement created! It will appear in your dashboard as unsigned.");
      setAgreementOpen(false);
      setAgreementListing(null);
    } catch (err) {
      console.error("Error creating agreement", err);
      alert("An error occurred while creating the agreement.");
    } finally {
      setAgreementSubmitting(false);
    }
  };

  const filteredProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.price >= priceRange[0] &&
          p.price <= priceRange[1] &&
          p.roommates <= maxRoommates &&
          p.distance <= maxDistance
      ),
    [properties, priceRange, maxRoommates, maxDistance]
  );

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-6">
        {/* Top heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Available </span>
              <span className="text-primary">Properties</span>
            </h1>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="font-semibold mb-1">Saved Properties</div>
            {savedProperties.size === 0 ? (
              <p>You have not saved any properties yet.</p>
            ) : (
              <p>{savedProperties.size} saved properties</p>
            )}
          </div>
        </div>

        {/* Top filter bar */}
        <div className="w-full mb-6 sticky top-16 z-20 bg-background pt-4 pb-2 border-b border-border">
          <div className="flex flex-wrap gap-4 items-center">
            <PropertyFilters
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              maxRoommates={maxRoommates}
              onMaxRoommatesChange={setMaxRoommates}
              maxDistance={maxDistance}
              onMaxDistanceChange={setMaxDistance}
            />
          </div>
        </div>

        {/* Main row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Property list */}
          <div className="xl:col-span-2 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              {filteredProperties.length} properties found
            </div>

            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                image={property.image}
                price={property.price}
                title={property.title}
                address={property.address}
                availableFrom={property.availableFrom}
                availableTo={property.availableTo}
                roommates={property.roommates}
                distance={property.distance}
                amenities={property.amenities}
                isSaved={savedProperties.has(String(property.id))}
                onSave={handleSaveProperty}
                ownerId={property.ownerId}
                onMessage={handleMessageOwner}
                // new props:
                canMakeAgreement={
                  !!currentUserId &&
                  !!property.ownerId &&
                  property.ownerId !== currentUserId
                }
                onMakeAgreement={() => handleStartAgreement(property)}
              />
            ))}
          </div>

          {/* Map */}
          <div className="hidden xl:block sticky top-32 h-[calc(100vh-10rem)]">
            <InteractiveMap />
          </div>
        </div>
      </div>

      {/* Messages modal triggered from property cards */}
      {currentUserId && (
        <MessagesModal
          open={messagesOpen}
          onOpenChange={setMessagesOpen}
          currentUserId={currentUserId}
          initialPeerId={messagePeerId}
          // no agreement button in the messages modal anymore
        />
      )}

      {/* Agreement creation modal */}
      <Dialog open={agreementOpen} onOpenChange={setAgreementOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Lease Agreement</DialogTitle>
            <DialogDescription>
              {agreementListing
                ? `You’re creating an agreement for: ${agreementListing.title}`
                : "Select a property first."}
            </DialogDescription>
          </DialogHeader>

          {agreementListing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={agreementForm.startDate}
                    onChange={(e) =>
                      setAgreementForm((f) => ({
                        ...f,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={agreementForm.endDate}
                    onChange={(e) =>
                      setAgreementForm((f) => ({
                        ...f,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rent (per month)</Label>
                  <Input
                    type="number"
                    value={agreementForm.rent}
                    onChange={(e) =>
                      setAgreementForm((f) => ({ ...f, rent: e.target.value }))
                    }
                    placeholder={String(agreementListing.price ?? "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit</Label>
                  <Input
                    type="number"
                    value={agreementForm.securityDeposit}
                    onChange={(e) =>
                      setAgreementForm((f) => ({
                        ...f,
                        securityDeposit: e.target.value,
                      }))
                    }
                    placeholder={
                      agreementListing.securityDeposit
                        ? String(agreementListing.securityDeposit)
                        : "500"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of People</Label>
                  <Input
                    type="number"
                    min={1}
                    value={agreementForm.numPeople}
                    onChange={(e) =>
                      setAgreementForm((f) => ({
                        ...f,
                        numPeople: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pay Term</Label>
                <Input
                  value={agreementForm.payTerm}
                  onChange={(e) =>
                    setAgreementForm((f) => ({
                      ...f,
                      payTerm: e.target.value,
                    }))
                  }
                  placeholder="monthly"
                />
              </div>

              <Button
                className="w-full mt-4"
                onClick={handleCreateAgreement}
                disabled={agreementSubmitting}
              >
                {agreementSubmitting ? "Creating..." : "Create Agreement"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Properties;
