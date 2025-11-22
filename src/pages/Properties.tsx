import { useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import InteractiveMap from "@/components/InteractiveMap";

//properties page to view and filter properties (change with actual data later)

const mockProperties = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    price: 850,
    title: "Modern Studio Near Campus",
    address: "123 State St, Madison, WI",
    availableFrom: "May 2025",
    availableTo: "Aug 2025",
    roommates: 0,
    distance: 0.3,
    amenities: ["WiFi", "Parking", "Laundry"],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1502672260066-6bc2681ea3ff?w=800&h=600&fit=crop",
    price: 650,
    title: "Cozy 2BR Apartment",
    address: "456 Johnson St, Madison, WI",
    availableFrom: "Jun 2025",
    availableTo: "Aug 2025",
    roommates: 1,
    distance: 0.8,
    amenities: ["WiFi", "AC", "Furnished"],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    price: 750,
    title: "Spacious 1BR with View",
    address: "789 University Ave, Madison, WI",
    availableFrom: "May 2025",
    availableTo: "Jul 2025",
    roommates: 0,
    distance: 0.5,
    amenities: ["Gym", "Pool", "WiFi"],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    price: 550,
    title: "Affordable Room in House",
    address: "321 Park St, Madison, WI",
    availableFrom: "Jun 2025",
    availableTo: "Aug 2025",
    roommates: 3,
    distance: 1.2,
    amenities: ["WiFi", "Kitchen", "Backyard"],
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop",
    price: 950,
    title: "Luxury Loft Downtown",
    address: "567 Capitol Square, Madison, WI",
    availableFrom: "May 2025",
    availableTo: "Aug 2025",
    roommates: 0,
    distance: 0.6,
    amenities: ["Gym", "Parking", "Concierge"],
  },
];

const Properties = () => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxRoommates, setMaxRoommates] = useState(10);
  const [maxDistance, setMaxDistance] = useState(10);
  const [savedProperties, setSavedProperties] = useState<Set<number>>(new Set());

  const handleSaveProperty = (id: number) => {
    const newSaved = new Set(savedProperties);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedProperties(newSaved);
  };

  const filteredProperties = mockProperties.filter(
    (property) =>
      property.price >= priceRange[0] &&
      property.price <= priceRange[1] &&
      property.roommates <= maxRoommates &&
      property.distance <= maxDistance
  );

  return (
  <div className="min-h-screen pt-20 pb-12">
    <div className="container mx-auto px-6">

      {/* ---------- Top Filter Bar ---------- */}
      <div className="w-full mb-6 sticky top-20 z-20 bg-background pt-4 pb-2 border-b border-border">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Replace these with your actual filter components */}
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

      {/* ---------- Main Content Row ---------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ---------- Property List (Left) ---------- */}
        <div className="xl:col-span-2 space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            {filteredProperties.length} properties found
          </div>

          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              isSaved={savedProperties.has(property.id)}
              onSave={handleSaveProperty}
            />
          ))}
        </div>

        {/* ---------- Map (Right) ---------- */}
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
