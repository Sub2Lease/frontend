// src/components/InteractiveMap.tsx
import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// You can later replace this with real coordinates from your listings
const mockProperties = [
  { id: 1, lat: 43.0731, lng: -89.4012, title: "Modern Studio" },
  { id: 2, lat: 43.0765, lng: -89.3998, title: "Cozy 2BR" },
  { id: 3, lat: 43.0745, lng: -89.4025, title: "Spacious 1BR" },
];

const InteractiveMap = () => {
  // Madison center
  const center = useMemo<LatLngExpression>(() => [43.0731, -89.4012], []);

  // Red glowing pin icon (black/white/red aesthetic)
  const redPinIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div class="relative">
            <div class="w-3 h-3 rounded-full bg-red-500 border border-white shadow-[0_0_12px_rgba(248,113,113,0.9)]"></div>
            <div class="absolute inset-0 rounded-full bg-red-500/40 blur-sm"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    []
  );

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Brighter grayscale base map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {mockProperties.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={redPinIcon}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.9}>
              <span className="font-semibold text-xs">{p.title}</span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* very subtle dark overlay, just to blend with UI */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
    </div>
  );
};

export default InteractiveMap;
