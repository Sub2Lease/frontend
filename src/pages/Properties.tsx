// pages/Properties.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import InteractiveMap from "@/components/InteractiveMap";
import { MessagesModal } from "@/components/MessagesModal";

const API_BASE = "https://sub2leasebackend.onrender.com";

interface ApiListing {
  _id?: string;
  rent?: number;
  address?: string;
  title?: string;
  capacity?: number;
  images?: string[];
  description?: string;
  owner?: string;
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
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("sub2lease_user");
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

  const currentUser = getCurrentUser();
  const currentUserId: string | null = currentUser?._id ?? null;
  console.log(currentUserId);

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
          availableFrom: "",
          availableTo: "",
          roommates: l.capacity ?? 0,
          distance: 0,
          amenities: [],
        }));

        setProperties(normalized);
      } catch (err) {
        console.error("Error loading listings", err);
      }
    };

    fetchListings();
  }, []);

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
    setSavedProperties(prev => {
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
      setSavedProperties(prev => {
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
          {/* Saved properties moved here in previous step – keep as-is */}
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
        />
      )}
    </div>
  );
};

export default Properties;
