import React from "react";

interface Props {
  priceRange: [number, number];
  onPriceChange: (val: [number, number]) => void;
  maxRoommates: number;
  onMaxRoommatesChange: (val: number) => void;
  maxDistance: number;
  onMaxDistanceChange: (val: number) => void;
  layout?: "horizontal" | "sidebar";
}

const PropertyFilters: React.FC<Props> = ({
  priceRange,
  onPriceChange,
  maxRoommates,
  onMaxRoommatesChange,
  maxDistance,
  onMaxDistanceChange,
  layout = "sidebar",
}) => {
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={
        isHorizontal
          ? "flex flex-row flex-wrap items-center gap-6 w-full"
          : "p-6 rounded-xl border border-border w-full bg-card space-y-6"
      }
    >

      {/* ------ PRICE RANGE ------ */}
      <div className={isHorizontal ? "flex flex-col w-auto" : "space-y-2"}>
        <label className="font-semibold text-sm">Price Range</label>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>–</span>
          <span>${priceRange[1]}</span>
        </div>

        <input
          type="range"
          min={0}
          max={2000}
          value={priceRange[1]}
          onChange={(e) =>
            onPriceChange([priceRange[0], Number(e.target.value)])
          }
          className="w-full accent-red-500"
        />
      </div>

      {/* ------ ROOMMATES ------ */}
      <div className={isHorizontal ? "flex flex-col w-auto" : "space-y-2"}>
        <label className="font-semibold text-sm">Max Roommates</label>

        <select
          value={maxRoommates}
          onChange={(e) => onMaxRoommatesChange(Number(e.target.value))}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm"
        >
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {/* ------ DISTANCE ------ */}
      <div className={isHorizontal ? "flex flex-col w-auto" : "space-y-2"}>
        <label className="font-semibold text-sm">Max Distance to Campus</label>

        <div className="text-xs text-muted-foreground">{maxDistance} miles</div>

        <input
          type="range"
          min={0}
          max={10}
          value={maxDistance}
          onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
          className="w-full accent-red-500"
        />
      </div>
    </div>
  );
};

export default PropertyFilters;
