import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import InteractiveMap from "@/components/InteractiveMap";

const API_BASE = "https://sub2leasebackend.onrender.com";

interface ApiUser {
  _id?: string;
  email?: string;
  name?: string;
}

interface ApiListing {
  _id?: string;
  rent?: number;
  address?: string;
  buildingName?: string;
  peopleCount?: number;
  images?: string[];
  description?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop";

const Properties = () => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxRoommates, setMaxRoommates] = useState(10);
  const [maxDistance, setMaxDistance] = useState(10);

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProperty = (id: string) => {
    // Local toggle only; TODO: call backend to persist in savedListings
    const next = new Set(savedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedIds(next);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Load all listings
        const listingsRes = await fetch(`${API_BASE}/listings`);
        if (!listingsRes.ok) {
          setError(`Failed to load listings (${listingsRes.status})`);
          setListings([]);
          setLoading(false);
          return;
        }
        const listingsData: ApiListing[] = await listingsRes.json();
        setListings(listingsData);

        // 2) Determine current user (from localStorage or /users)
        let userId: string | null = null;

        const stored = localStorage.getItem("sub2lease_user");
        if (stored) {
          try {
            const u: ApiUser = JSON.parse(stored);
            if (u && u._id) userId = u._id.toString();
          } catch {
            // ignore parse errors
          }
        }

        if (!userId) {
          try {
            const usersRes = await fetch(`${API_BASE}/users`);
            if (usersRes.ok) {
              const users: ApiUser[] = await usersRes.json();
              if (users && users.length > 0 && users[0]._id) {
                userId = users[0]._id.toString();
              }
            }
          } catch (err) {
            console.error("Error loading users", err);
          }
        }

        if (userId) {
          setCurrentUserId(userId);
          // 3) Load saved listings for that user
          try {
            const savedRes = await fetch(
              `${API_BASE}/listings/saved/${encodeURIComponent(userId)}`
            );
            if (savedRes.ok) {
              const savedListings: ApiListing[] = await savedRes.json();
              setSavedIds(
                new Set(
                  savedListings.map((l) =>
                    (l._id || "").toString()
                  )
                )
              );
            }
          } catch (err) {
            console.error("Error loading saved listings", err);
          }
        }
      } catch (err) {
        console.error("Error loading listings", err);
        setError("Error loading listings");
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProperties = listings.filter((listing) => {
    const price = listing.rent ?? 0;
    const roommates = listing.peopleCount ?? 0;
    const distance = 0; // TODO: add distance to listing schema later

    return (
      price >= priceRange[0] &&
      price <= priceRange[1] &&
      roommates <= maxRoommates &&
      distance <= maxDistance
    );
  });

  const savedListingCards = listings.filter((listing) =>
    savedIds.has((listing._id || "").toString())
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">
          Available <span className="text-primary">Properties</span>
        </h1>

        {/* Top Filter Bar + Saved Properties */}
        <div className="w-full mb-6 sticky top-20 z-20 bg-background pt-4 pb-4 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <PropertyFilters
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                maxRoommates={maxRoommates}
                onMaxRoommatesChange={setMaxRoommates}
                maxDistance={maxDistance}
                onMaxDistanceChange={setMaxDistance}
              />
            </div>

            {/* Saved properties moved here from Dashboard */}
            <div className="w-full lg:w-80">
              <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                Saved Properties
              </h3>
              {savedListingCards.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  You have not saved any properties yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
                  {savedListingCards.map((listing) => {
                    const id = (listing._id || "").toString();
                    const title =
                      listing.buildingName ||
                      listing.address ||
                      "Saved listing";
                    const addr = listing.address || "";
                    const price = listing.rent ?? 0;

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between px-3 py-2 rounded-md border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="mr-2">
                          <p className="font-medium truncate max-w-[140px]">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {addr}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          ${price}/mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Property List (Left) */}
          <div className="xl:col-span-2 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              {loading
                ? "Loading subleases..."
                : `${filteredProperties.length} properties found`}
            </div>

            {error && (
              <p className="text-sm text-red-500">Error: {error}</p>
            )}

            {!loading && !error && listings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No subleases have been posted yet.
              </p>
            )}

            {!loading &&
              !error &&
              listings.length > 0 &&
              filteredProperties.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No properties match your filters. Try adjusting them.
                </p>
              )}

            {!loading &&
              !error &&
              filteredProperties.map((listing) => {
                const id = (listing._id || "").toString();
                const title =
                  listing.buildingName ||
                  listing.address ||
                  "Sublease";
                const address = listing.address || "";
                const image =
                  (listing.images && listing.images[0]) ||
                  FALLBACK_IMAGE;
                const price = listing.rent ?? 0;
                const roommates = listing.peopleCount ?? 0;
                const description = listing.description || "";

                return (
                  <PropertyCard
                    key={id}
                    id={id as any} // TS: PropertyCard currently expects number; adjust that later
                    image={image}
                    price={price}
                    title={title}
                    address={address}
                    availableFrom={""}
                    availableTo={""}
                    roommates={roommates}
                    distance={0} // TODO
                    amenities={
                      description
                        ? [description.slice(0, 20) + "..."]
                        : []
                    }
                    isSaved={savedIds.has(id)}
                    onSave={(listingId) =>
                      handleSaveProperty(String(listingId))
                    }
                  />
                );
              })}
          </div>

          {/* Map (Right) */}
          <div className="hidden xl:block sticky top-32 h-[calc(100vh-10rem)]">
            <div className="w-full h-full rounded-lg overflow-hidden border border-border">
              <InteractiveMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
