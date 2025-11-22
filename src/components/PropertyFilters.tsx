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
  layout?: "horizontal" | "sidebar";
}

const PropertyFilters = ({
  priceRange,
  onPriceChange,
  maxRoommates,
  onMaxRoommatesChange,
  maxDistance,
  onMaxDistanceChange,
  layout = "sidebar",
}: PropertyFiltersProps) => {
  const isHorizontal = layout === "horizontal";

  // Outer wrapper changes depending on layout
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    isHorizontal ? (
      <div className="flex flex-row flex-wrap gap-8 items-center w-full">
        {children}
      </div>
    ) : (
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    );

  // Individual filter block layout
  const block = (children: React.ReactNode) =>
    isHorizontal ? (
      <div className="flex flex-col w-auto space-y-2">{children}</div>
    ) : (
      <div className="space-y-3">{children}</div>
    );

  return (
    <Wrapper>
      {/* PRICE RANGE */}
      {block(
        <>
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
            className="w-full max-w-[200px]"
          />
        </>
      )}

      {/* ROOMMATES */}
      {block(
        <>
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
        </>
      )}

      {/* DISTANCE */}
      {block(
        <>
          <Label>Max Distance to Campus</Label>
          <div className="text-sm text-muted-foreground">
            {maxDistance} miles
          </div>
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={[maxDistance]}
            onValueChange={(v) => onMaxDistanceChange(v[0])}
            className="w-full max-w-[200px]"
          />
        </>
      )}
    </Wrapper>
  );
};

export default PropertyFilters;
