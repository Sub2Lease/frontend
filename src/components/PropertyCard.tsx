import { Heart, MapPin, Calendar, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Display property card details (get from backend later)
interface PropertyCardProps {
  id: number;
  image: string;
  price: number;
  title: string;
  address: string;
  availableFrom: string;
  availableTo: string;
  roommates: number;
  distance: number;
  amenities: string[];
  onSave?: (id: number) => void;
  isSaved?: boolean;
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
}: PropertyCardProps) => {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(id);
  };

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-3 right-3 ${
            saved ? "text-primary bg-background/90" : "text-foreground bg-background/70"
          } hover:bg-background/90 transition-all`}
          onClick={handleSave}
        >
          <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
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
            {availableFrom} - {availableTo}
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
        
        <div className="flex flex-wrap gap-2 pt-2">
          {amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
