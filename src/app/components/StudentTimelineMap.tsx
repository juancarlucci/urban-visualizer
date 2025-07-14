"use client";

import { useEffect, useState, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { useStudentStore } from "@/lib/studentsStore";
import { generateRandomStudents } from "@/lib/generateStudents";
import { loadSubwayStations, SubwayStation } from "@/lib/subwayStations";
import { loadSubwayLines, SubwayLineFeature } from "@/lib/subwayLines";
import TimelineControls from "./TimelineControls";
import { MapLayers } from "./MapLayers";

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
  const [algorithm, setAlgorithm] = useState<"dijkstra" | "astar">("dijkstra");
  const [debugEdges, setDebugEdges] = useState<[number, number][][]>([]);
  const [isReverse, setIsReverse] = useState(false);
  const [totalVisited, setTotalVisited] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const cacheRef = useRef<{
    dijkstra?: {
      students: Student[];
      debugEdges: [number, number][][];
      totalVisited: number;
    };
    astar?: {
      students: Student[];
      debugEdges: [number, number][][];
      totalVisited: number;
    };
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubwayLines().then((loaded) => setLines(loaded));
  }, []);

  useEffect(() => {
    if (stations.length > 0 && lines.length > 0) {
      generateRandomStudents(100000, stations, algorithm).then(
        ({ students, debugEdges }) => {
          setStudents(students.slice(0, 500)); // show only 500 animated
          setDebugEdges(debugEdges);
          setTotalVisited(
            students.reduce((sum, s) => sum + (s.visitedPath?.length || 0), 0)
          );
          setStudentCount(students.length);
        }
      );
    }
  }, [algorithm]); // Regenerate on algorithm switch

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadSubwayStations(), loadSubwayLines()])
      .then(([loadedStations, loadedLines]) => {
        setStations(loadedStations);
        setLines(loadedLines);
        if (
          students.length === 0 &&
          loadedStations.length > 0 &&
          loadedLines.length > 0
        ) {
          if (cacheRef.current[algorithm]) {
            const { students, debugEdges, totalVisited } =
              cacheRef.current[algorithm]!;
            setStudents(students.slice(0, 500));
            setDebugEdges(debugEdges);
            setTotalVisited(totalVisited);
            setStudentCount(students.length);
          } else {
            generateRandomStudents(100000, stations, algorithm).then(
              ({ students, debugEdges }) => {
                const totalVisited = students.reduce(
                  (sum, s) => sum + (s.visitedPath?.length || 0),
                  0
                );
                cacheRef.current[algorithm] = {
                  students,
                  debugEdges,
                  totalVisited,
                };
                setStudents(students.slice(0, 500));
                setDebugEdges(debugEdges);
                setTotalVisited(totalVisited);
                setStudentCount(students.length);
              }
            );
          }
        }
      })
      .finally(() => setIsLoading(false));
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

  const layers = MapLayers({ students, lines, currentTime, debugEdges });

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

      <div className="flex absolute bottom-10 left-1/2 transform -translate-x-1/2 w-11/12 max-w-xl bg-white/90 p-4 rounded shadow space-y-2 z-50">
        <TimelineControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onReverse={() => {
            setIsReverse((prev) => !prev);
            setStudents(
              students.map((s) => ({
                ...s,
                route: s.route.slice().reverse(), //* slice() to avoid mutating original route
              }))
            );
            setTime(0);
            timeRef.current = 0;
          }}
          currentTime={currentTime}
          onTimeChange={(t) => setTime(t)}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          isReverse={isReverse}
        >
          <div className="text-sm font-medium text-gray-800">
            Routing with: {algorithm.toUpperCase()} <br />
            {isLoading
              ? "Calculating paths..."
              : `Avg. visited nodes: ${(totalVisited / studentCount).toFixed(
                  1
                )}`}
          </div>
        </TimelineControls>
      </div>
    </div>
  );
}
