// components/PropertyCard.tsx
import { Heart, MapPin, Calendar, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: string | number;
  image: string;
  price: number;
  securityDeposit: number;
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
  // NEW: agreement controls
  canMakeAgreement?: boolean;
  onMakeAgreement?: () => void;
}

const PropertyCard = ({
  id,
  image,
  price,
  securityDeposit,
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
  canMakeAgreement,
  onMakeAgreement,
}: PropertyCardProps) => {
  const handleSave = () => {
    onSave?.(id);
  };

  const handleMessage = () => {
    if (!ownerId) return;
    onMessage?.(ownerId);
  };

  const handleMakeAgreement = () => {
    if (!canMakeAgreement) return;
    onMakeAgreement?.();
  };

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Save button */}
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

        {securityDeposit !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>${securityDeposit} Security Deposit</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>

          {/* Actions: Message + Make Agreement */}
          <div className="flex gap-2 ml-auto">
            {ownerId && onMessage && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMessage}
              >
                Message
              </Button>
            )}

            {canMakeAgreement && onMakeAgreement && (
              <Button size="sm" onClick={handleMakeAgreement}>
                Make Agreement
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
