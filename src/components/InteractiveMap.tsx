import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

// Mock property data for pins
const mockProperties = [
  { id: 1, lat: 43.0731, lng: -89.4012, title: "Modern Studio" },
  { id: 2, lat: 43.0765, lng: -89.3998, title: "Cozy 2BR" },
  { id: 3, lat: 43.0745, lng: -89.4025, title: "Spacious 1BR" },
  { id: 4, lat: 43.0720, lng: -89.4050, title: "Affordable Room" },
  { id: 5, lat: 43.0755, lng: -89.4010, title: "Luxury Loft" },
];

const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [tokenSubmitted, setTokenSubmitted] = useState(false);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-89.4012, 43.0731], // UW Madison coordinates
      zoom: 14,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add property pins
    map.current.on("load", () => {
      mockProperties.forEach((property) => {
        const el = document.createElement("div");
        el.className = "w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_hsl(var(--primary))] cursor-pointer hover:scale-125 transition-transform animate-pulse-glow";
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([property.lng, property.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="text-foreground bg-card p-2 rounded">
                  <h3 class="font-bold">${property.title}</h3>
                  <p class="text-sm text-muted-foreground">Click to view details</p>
                </div>
              `)
          )
          .addTo(map.current!);
      });
    });
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setTokenSubmitted(true);
      initializeMap(mapboxToken.trim());
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!tokenSubmitted) {
    return (
      <div className="relative w-full h-full bg-card/50 backdrop-blur-sm rounded-lg border border-border flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Mapbox Token Required</h3>
            <p className="text-sm text-muted-foreground">
              Enter your Mapbox public token to view the interactive map. Get one free at{" "}
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
            </p>
          </div>
          <form onSubmit={handleTokenSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="pk.ey..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full"
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Initialize Map
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Search bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Madison..."
            className="pl-10 bg-card/90 backdrop-blur-sm border-border/50"
          />
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/20 via-transparent to-background/20 rounded-lg" />
    </div>
  );
};

export default InteractiveMap;
