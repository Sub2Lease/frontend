import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
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
            onValueChange={(value) => onPriceChange(value as [number, number])}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="roommates">Max Roommates</Label>
          <Input
            id="roommates"
            type="number"
            min={0}
            max={10}
            value={maxRoommates}
            onChange={(e) => onMaxRoommatesChange(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-3">
          <Label>Max Distance to Campus</Label>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{maxDistance} miles</span>
          </div>
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={[maxDistance]}
            onValueChange={(value) => onMaxDistanceChange(value[0])}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilters;
