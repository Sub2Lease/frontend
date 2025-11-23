// components/PropertyCard.tsx
import { Heart, MapPin, Calendar, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: string | number;
  image: string;
  price: number;
  title: string;
  address: string;
  availableFrom?: string;
  availableTo?: string;
  roommates: number;
  distance: number;
  amenities: string[];
  onSave?: (id: number | string) => void;
  isSaved?: boolean;
  ownerId?: string;
  onMessage?: (ownerId: string) => void;
}

const PropertyCard = ({
  id,
  image,
  price,
  title,
  address,
  availableFrom,
  availableTo,
  roommates,
  distance,
  amenities,
  onSave,
  isSaved = false,
  ownerId,
  onMessage,
}: PropertyCardProps) => {
  
  const handleSave = () => {
    onSave?.(id);
  };

  const handleMessage = () => {
    if (!ownerId) return;
    onMessage?.(ownerId);
  };

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Save button — now controlled by props */}
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-3 right-3 ${
            isSaved
              ? "text-primary bg-background/90"
              : "text-foreground bg-background/70"
          } hover:bg-background/90 transition-all`}
          onClick={handleSave}
        >
          <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
        </Button>

        <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground font-bold text-lg">
          ${price}/mo
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">{title}</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{address}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {availableFrom && availableTo
              ? `${availableFrom} - ${availableTo}`
              : "-"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{roommates} roommates</span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-4 h-4" />
            <span>{distance} mi to campus</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>

          {ownerId && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMessage}
              className="ml-auto"
            >
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
