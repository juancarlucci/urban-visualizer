// File: src/app/components/AnimatedRoute.tsx
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route: LatLngExpression[] = [
  [37.7749, -122.4194], // San Francisco
  [36.7783, -119.4179], // Fresno
  [34.0522, -118.2437], // Los Angeles
];

function AnimatedMarker() {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const marker = L.marker(route[0]).addTo(map);
    markerRef.current = marker;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= route.length) {
        clearInterval(interval);
        return;
      }
      marker.setLatLng(route[indexRef.current]);
    }, 1000); // Move marker every 1 second

    return () => {
      clearInterval(interval);
      map.removeLayer(marker);
    };
  }, [map]);

  return null;
}

export default function AnimatedRoute() {
  return (
    <MapContainer
      center={[36.7783, -119.4179]}
      zoom={6}
      scrollWheelZoom={true}
      className="h-[600px] w-full rounded-2xl shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={route} color="blue" />
      <AnimatedMarker />
    </MapContainer>
  );
}
