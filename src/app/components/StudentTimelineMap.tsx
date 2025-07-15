"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import { useStudentStore } from "@/lib/studentsStore";
import {
  generateFullStudentSet,
  generateInitialStudents,
} from "@/lib/generateStudents";
import { loadSubwayStations, SubwayStation } from "@/lib/subwayStations";
import { loadSubwayLines, SubwayLineFeature } from "@/lib/subwayLines";
import TimelineControls from "./TimelineControls";
import { MapLayers } from "./MapLayers";
import type { Student } from "@/lib/studentsStore";
import AlgorithmControls from "./AlgorithmControls";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface CacheResult {
  students: Student[];
  debugEdges: [number, number][][];
  totalVisited: number;
}

export default function StudentTimelineMap() {
  const {
    students,
    setStudents,
    setTime,
    currentTime: currentTimeRaw,
  } = useStudentStore();
  const currentTime = Number.isFinite(currentTimeRaw) ? currentTimeRaw : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [stations, setStations] = useState<SubwayStation[]>([]);
  const [lines, setLines] = useState<SubwayLineFeature[]>([]);
  const [algorithm, setAlgorithm] = useState<"dijkstra" | "astar">("dijkstra");
  const [debugEdges, setDebugEdges] = useState<[number, number][][]>([]);
  const [isReverse, setIsReverse] = useState(false);
  const [totalVisited, setTotalVisited] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(currentTime);
  const cacheRef = useRef<
    Record<"dijkstra" | "astar", CacheResult | undefined>
  >({
    dijkstra: undefined,
    astar: undefined,
  });
  const [mapVisible, setMapVisible] = useState(false);
  const [showVisited, setShowVisited] = useState(false);
  const [isSliderInteracting, setIsSliderInteracting] = useState(false);
  const [isInteractingWithControls, setIsInteractingWithControls] =
    useState(false);

  const visitedNodes = useMemo(() => {
    if (!showVisited) return [];
    const seen = new Set<number>();
    students.forEach((s) => {
      s.visitedPath?.forEach(([from, to]) => {
        seen.add(from);
        seen.add(to);
      });
    });
    return Array.from(seen);
  }, [students, showVisited]);

  useEffect(() => {
    if (stations.length > 0 && students.length > 0) {
      const timeout = setTimeout(() => setMapVisible(true), 250); // show map shortly after
      return () => clearTimeout(timeout);
    }
  }, [stations, students]);

  // Load subway data on mount
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([loadSubwayStations(), loadSubwayLines()])
      .then(([loadedStations, loadedLines]) => {
        if (mounted) {
          setStations(loadedStations);
          setLines(loadedLines);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading subway data:", err);
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  //* Load students when algorithm, stations, or lines change
  useEffect(() => {
    if (stations.length > 0 && lines.length > 0) {
      const cached = cacheRef.current[algorithm];
      if (cached) {
        setStudents(cached.students.slice(0, 500));
        setDebugEdges(cached.debugEdges);
        setTotalVisited(cached.totalVisited);
        setStudentCount(cached.students.length);
        setIsLoading(false);
        return; // ✅ stop early if already cached
      }

      // Load 15 students for fast demo
      generateInitialStudents(stations, algorithm).then(
        ({ students, debugEdges }) => {
          setStudents(students);
          setDebugEdges(debugEdges);
          setTotalVisited(0);
          setStudentCount(students.length);

          // Start full async background load
          generateFullStudentSet(stations, algorithm).then(
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
              setIsLoading(false);
            }
          );
        }
      );
    }
  }, [stations, lines, algorithm, setStudents]);

  // Animation logic
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
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, setTime]);

  const layers = MapLayers({
    students,
    lines,
    stations,
    visitedNodes,
    currentTime,
    debugEdges,
  });
  if (stations.length === 0 || lines.length === 0 || students.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-lg">
        Loading map...
      </div>
    );
  }
  return (
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
      style={{ pointerEvents: isInteractingWithControls ? "none" : "auto" }}
    >
      {mapVisible && (
        <Map
          reuseMaps
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/juancarlucci/cj4ixk05q1a3x2spb44qq9cy3"
        />
      )}

      <TimelineControls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReverse={() => {
          // cacheRef.current = { dijkstra: undefined, astar: undefined };
          setIsReverse((prev) => !prev);
          setStudents(
            students.map((s) => ({
              ...s,
              route: [...s.route].reverse(), // Ensure immutability
            }))
          );
          setTime(0);
          timeRef.current = 0;
        }}
        currentTime={currentTime}
        onTimeChange={setTime}
        isReverse={isReverse}
        onInteractionChange={setIsInteractingWithControls}
      >
        <AlgorithmControls
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          // showVisited={showVisited}
          // setShowVisited={setShowVisited}
          isLoading={isLoading}
          studentCount={studentCount}
          totalVisited={totalVisited}
        />
      </TimelineControls>
    </DeckGL>
  );
}
