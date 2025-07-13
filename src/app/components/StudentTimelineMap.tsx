"use client";

import { useEffect, useState, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import { useStudentStore } from "@/lib/studentsStore";
import { generateRandomStudents } from "@/lib/generateStudents";
import { getAnimatedPosition, getTrailPoints } from "@/lib/animate";
import { loadSubwayStations, SubwayStation } from "@/lib/subwayStations";
import { loadSubwayLines, SubwayLineFeature } from "@/lib/subwayLines";
import { SCHOOL } from "@/lib/constants";
import { Student } from "@/lib/studentsStore";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function StudentTimelineMap() {
  const students = useStudentStore((s) => s.students);
  const setStudents = useStudentStore((s) => s.setStudents);
  const setTime = useStudentStore((s) => s.setTime);
  const currentTimeRaw = useStudentStore((s) => s.currentTime);
  const currentTime = Number.isFinite(currentTimeRaw) ? currentTimeRaw : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [stations, setStations] = useState<SubwayStation[]>([]);
  const [lines, setLines] = useState<SubwayLineFeature[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(currentTime);

  useEffect(() => {
    loadSubwayLines().then((loaded) => setLines(loaded));
  }, []);

  useEffect(() => {
    loadSubwayStations().then((loaded) => {
      setStations(loaded);
      if (students.length === 0) {
        generateRandomStudents(loaded).then((generated) => {
          setStudents(generated);
        });
      }
    });
  }, []);

  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        const next = Math.min(timeRef.current + 0.002, 1);
        timeRef.current = next;
        setTime(next);
        if (next >= 1) {
          setIsPlaying(false);
          return;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, setTime]);

  const layers = [
    new PathLayer({
      id: "subway-lines",
      data: lines,
      getPath: (d) => d.geometry.coordinates,
      getWidth: 4,
      getColor: () => [30, 144, 255, 160],
      widthUnits: "pixels",
      pickable: true,
    }),

    new ScatterplotLayer({
      id: "student-homes",
      data: students,
      getPosition: (d) => d.route?.[0] ?? [d.lng, d.lat],
      getFillColor: (d) => hexToRgb(d.color, 100),
      getRadius: 60,
      radiusUnits: "meters",
      pickable: false,
    }),

    new ScatterplotLayer({
      id: `student-trails-${currentTime}`,
      data: Array.isArray(students)
        ? students.flatMap((student) =>
            getTrailPoints(student, currentTime).map((pos, i) => ({
              ...student,
              lat: pos[1],
              lng: pos[0],
              alpha: Math.max(60 - i * 6, 0),
            }))
          )
        : [],
      getPosition: (d) => [d.lng, d.lat],
      getFillColor: (d) => hexToRgb(d.color, d.alpha),
      getRadius: 80,
      radiusUnits: "meters",
      pickable: false,
    }),

    new ScatterplotLayer({
      id: `students-animated-${currentTime}`,
      data: students,
      getPosition: (d) => getAnimatedPosition(d, currentTime),
      getFillColor: (d) => hexToRgb(d.color, 255),
      getRadius: 120,
      radiusUnits: "meters",
      pickable: true,
      updateTriggers: {
        getPosition: [currentTime],
      },
    }),

    new ScatterplotLayer({
      id: "school-location",
      data: [{ position: [SCHOOL.lng, SCHOOL.lat] }],
      getPosition: (d) => d.position,
      getFillColor: [0, 0, 0, 200],
      getRadius: 140,
      radiusUnits: "meters",
      pickable: false,
    }),
  ];

  return (
    <div className="relative h-screen w-full">
      <DeckGL
        initialViewState={{
          longitude: -73.94,
          latitude: 40.75,
          zoom: 10.5,
          pitch: 0,
          bearing: 0,
        }}
        controller={true}
        layers={layers}
        getTooltip={({ object }) => object?.name && { text: object.name }}
      >
        <Map
          reuseMaps
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/juancarlucci/cj4ixk05q1a3x2spb44qq9cy3"
        />
      </DeckGL>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-xl bg-white/90 p-4 rounded shadow space-y-2">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="bg-black text-white px-4 py-2 rounded shadow"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <span className="text-sm font-medium text-gray-700">
            Time of Day: {formatTime(currentTime, students)}
          </span>
          <button
            onClick={() => {
              setStudents(
                students.map((s) => ({
                  ...s,
                  route: s.route.slice().reverse(),
                }))
              );
              setTime(0);
              timeRef.current = 0;
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded shadow"
          >
            Reverse Commute
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={Number.isFinite(currentTime) ? currentTime : 0}
          onChange={(e) => setTime(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
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

function formatTime(time: number, students: Student[]): string {
  const isAfternoon = students.some((s) => s.route?.[0]?.[0] === SCHOOL.lng);
  const startMinutes = isAfternoon ? 15 * 60 + 45 : 6 * 60;
  const endMinutes = isAfternoon ? 16 * 60 + 55 : 8 * 60;
  const totalMinutes = startMinutes + time * (endMinutes - startMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours}:${minutes.toString().padStart(2, "0")} ${
    hours >= 12 ? "PM" : "AM"
  }`;
}
