import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import InteractiveMap from "@/components/InteractiveMap";
import { supabase } from "@/integrations/supabase/client";

interface SubleaseRow {
  id: string | number;
  title: string;
  price: number | null;
  address: string | null;
  available_from: string | null;
  available_to: string | null;
  roommates: number | null;
  distance: number | null;
  image_url: string | null;
  amenities: string[] | string | null;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop";

const normalizeAmenities = (
  amenities: SubleaseRow["amenities"]
): string[] => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities.filter(Boolean);
  return amenities
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
};

const Properties = () => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxRoommates, setMaxRoommates] = useState(10);
  const [maxDistance, setMaxDistance] = useState(10);
  const [savedProperties, setSavedProperties] = useState<Set<string | number>>(
    new Set()
  );

  const [subleases, setSubleases] = useState<SubleaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProperty = (id: number | string) => {
    const newSaved = new Set(savedProperties);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedProperties(newSaved);
  };

  // Load all subleases from Supabase
  useEffect(() => {
    const fetchSubleases = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("subleases") // 👈 change table name if needed
        .select("*")
        .order("created_at", { ascending: false }); // optional if you have created_at

      if (error) {
        console.error("Error loading subleases:", error);
        setError(error.message);
        setSubleases([]);
      } else {
        setSubleases(data ?? []);
      }

      setLoading(false);
    };

    fetchSubleases();
  }, []);

  const filteredProperties = subleases.filter((property) => {
    const price = property.price ?? 0;
    const roommates = property.roommates ?? 0;
    const distance = property.distance ?? 0;

    return (
      price >= priceRange[0] &&
      price <= priceRange[1] &&
      roommates <= maxRoommates &&
      distance <= maxDistance
    );
  });

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">
          Available <span className="text-primary">Properties</span>
        </h1>

        {/* Top Filter Bar */}
        <div className="w-full mb-6 sticky top-20 z-20 bg-background pt-4 pb-2 border-b border-border">
          <PropertyFilters
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            maxRoommates={maxRoommates}
            onMaxRoommatesChange={setMaxRoommates}
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
          />
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
              <p className="text-sm text-red-500">
                Failed to load subleases: {error}
              </p>
            )}

            {!loading && !error && subleases.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No subleases have been posted yet.
              </p>
            )}

            {!loading &&
              !error &&
              subleases.length > 0 &&
              filteredProperties.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No properties match your filters. Try adjusting them.
                </p>
              )}

            {!loading &&
              !error &&
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id as number | string}
                  image={property.image_url || FALLBACK_IMAGE}
                  price={property.price ?? 0}
                  title={property.title}
                  address={property.address ?? "Address not specified"}
                  availableFrom={property.available_from ?? ""}
                  availableTo={property.available_to ?? ""}
                  roommates={property.roommates ?? 0}
                  distance={property.distance ?? 0}
                  amenities={normalizeAmenities(property.amenities)}
                  isSaved={savedProperties.has(property.id)}
                  onSave={handleSaveProperty}
                />
              ))}
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
