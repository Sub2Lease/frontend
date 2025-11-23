// src/components/InteractiveMap.tsx
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { API_BASE } from "../constants";

interface ApiListing {
  _id: string;
  title: string;
  address: string;
  rent?: number;
  capacity?: number;
  images?: string[];
  latitude?: number;
  longitude?: number;
}

/* ------------------------ Popup Card Component ------------------------ */
const MapCard = ({ listing }: { listing: ApiListing }) => {
  return (
    <div className="w-60 rounded-xl shadow-lg bg-white text-black overflow-hidden border border-gray-200">
      <div className="h-28 w-full overflow-hidden">
        <img
          src={listing.images?.[0] || "https://via.placeholder.com/300"}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3 space-y-1">
        <div className="font-bold text-lg">
          ${listing.rent?.toLocaleString() ?? "N/A"}
        </div>

        <div className="text-sm text-gray-600">
          {listing.capacity ?? "1"} Bed • {listing.address}
        </div>

        <div className="font-semibold text-sm">{listing.title}</div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------- */

type InteractiveMapProps = {
  /** "card" = bordered card (properties page), "background" = full-bleed (landing) */
  variant?: "card" | "background";
};

const InteractiveMap = ({ variant = "card" }: InteractiveMapProps) => {
  const [listings, setListings] = useState<ApiListing[]>([]);

  const defaultCenter = useMemo<LatLngExpression>(
    () => [43.0731, -89.4012],
    []
  );

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

  useEffect(() => {
    async function loadListings() {
      try {
        // use /listings endpoint to get coordinates
        const res = await fetch(`${API_BASE}/listings`);
        const data: ApiListing[] = await res.json();

        const valid = data.filter(
          (l) =>
            typeof l.latitude === "number" && typeof l.longitude === "number"
        );

        setListings(valid);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      }
    }

    loadListings();
  }, []);

  const wrapperClass =
    variant === "background"
      ? "relative w-full h-full overflow-hidden" // no border / radius for full-screen background
      : "relative w-full h-full rounded-lg overflow-hidden border border-border";

  return (
    <div className={wrapperClass}>
      <MapContainer
        center={defaultCenter}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {listings.map((l) => (
          <Marker
            key={l._id}
            position={[l.latitude!, l.longitude!]}
            icon={redPinIcon}
            eventHandlers={{
              mouseover: (e) => e.target.openPopup(),
              mouseout: (e) => e.target.closePopup(),
            }}
          >
            <Popup closeButton={false} offset={[0, -10]}>
              <MapCard listing={l} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Only add extra overlay in card mode; landing already has its own gradient */}
      {variant === "card" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      )}
    </div>
  );
};

export default InteractiveMap;
