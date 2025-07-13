//* File: src/app/components/MapClient.tsx
"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AnimatedRoute from "./AnimatedRoute";

//* Fix Leaflet's missing marker icons in modern bundlers (like Vite or Next.js)
//* Leaflet expects icon assets to be bundled differently, so we manually override
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

//* Define coordinates for SF → LA
const positions: [number, number][] = [
  [37.7749, -122.4194], // San Francisco
  [36.7783, -119.4179], // Central CA (optional midpoint)
  [34.0522, -118.2437], // Los Angeles
];

export default function MapClient() {
  return (
    <MapContainer
      center={[36.5, -120.5]} // Midpoint view
      zoom={6.5}
      scrollWheelZoom={true}
      className="h-[600px] w-full rounded-2xl shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Polyline
        positions={positions}
        pathOptions={{ className: "animated-path" }}
      /> */}
      <AnimatedRoute />
      <Marker position={[37.7749, -122.4194]}>
        <Popup>📍 San Francisco</Popup>
      </Marker>

      <Marker position={[34.0522, -118.2437]}>
        <Popup>📍 Los Angeles</Popup>
      </Marker>
    </MapContainer>
  );
}
