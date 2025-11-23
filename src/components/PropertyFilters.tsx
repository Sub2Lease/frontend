// src/components/PropertyFilters.tsx
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PropertyFiltersProps {
  priceRange: [number, number];
  onPriceChange: (value: [number, number]) => void;
  maxRoommates: number;
  onMaxRoommatesChange: (value: number) => void;
  maxDistance: number;
  onMaxDistanceChange: (value: number) => void;
}

const PropertyFilters = ({
  priceRange,
  onPriceChange,
  maxRoommates,
  onMaxRoommatesChange,
  maxDistance,
  onMaxDistanceChange,
}: PropertyFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-8 w-full">
      {/* PRICE RANGE */}
      <div className="flex flex-col gap-1">
        <Label>Price Range</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>-</span>
          <span>${priceRange[1]}</span>
        </div>
        <Slider
          min={0}
          max={2000}
          step={50}
          value={priceRange}
          onValueChange={(v) => onPriceChange(v as [number, number])}
          className="w-full max-w-[220px]"
        />
      </div>

      {/* ROOMMATES */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="roommates">Max Roommates</Label>
        <Input
          id="roommates"
          type="number"
          min={0}
          max={10}
          value={maxRoommates}
          onChange={(e) =>
            onMaxRoommatesChange(parseInt(e.target.value) || 0)
          }
          className="w-[100px]"
        />
      </div>
    </div>
  );
};

export default PropertyFilters;
