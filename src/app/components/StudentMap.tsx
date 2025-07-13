"use client";

import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { ScatterplotLayer } from "@deck.gl/layers";
import { useStudentStore } from "@/lib/studentsStore";
import { useEffect, useState } from "react";
import { generateRandomStudents } from "@/lib/generateStudents";

//* Styles
const styleA = "mapbox://styles/juancarlucci/cj4ixk05q1a3x2spb44qq9cy3";
const styleB = "mapbox://styles/juancarlucci/cj4zwt62c14mj2socoo25r76v";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function StudentMap() {
  const students = useStudentStore((s) => s.students);
  const setStudents = useStudentStore((s) => s.setStudents);
  const [mapStyle, setMapStyle] = useState(styleA);

  useEffect(() => {
    if (students.length === 0) {
      const random = generateRandomStudents();
      setStudents(random);
    }
  }, []);

  const layers = [
    new ScatterplotLayer({
      id: "students",
      data: students,
      getPosition: (d) => [d.lng, d.lat],
      getFillColor: (d) => hexToRgb(d.color, 180),
      getRadius: 100,
      radiusUnits: "meters",
      pickable: true,
    }),
  ];

  return (
    <div className="relative h-screen w-full">
      <DeckGL
        initialViewState={{
          longitude: -73.94,
          latitude: 40.72,
          zoom: 10.5,
          pitch: 0,
          bearing: 0,
        }}
        controller={true}
        layers={layers}
      >
        <Map reuseMaps mapboxAccessToken={MAPBOX_TOKEN} mapStyle={mapStyle} />
      </DeckGL>

      {/* 🟡 Toggle button */}
      <button
        onClick={() =>
          setMapStyle((prev) => (prev === styleA ? styleB : styleA))
        }
        className="absolute top-4 left-4 bg-white text-black px-4 py-2 rounded shadow"
      >
        Toggle Map Style
      </button>
    </div>
  );
}

function hexToRgb(hex: string, alpha = 255): [number, number, number, number] {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b, alpha];
}
