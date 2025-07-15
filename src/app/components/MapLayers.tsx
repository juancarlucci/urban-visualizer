//* MapLayers.tsx
//* This component defines all Deck.GL layers for rendering subway lines, student routes, homes, and the school.
//* It promotes separation of concerns by isolating map visuals from map logic.
import { ColumnLayer, PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { Student } from "@/lib/studentsStore";
import { getAnimatedPosition, getTrailPoints } from "@/lib/animate";
import { SCHOOL } from "@/lib/constants";
import type { SubwayLineFeature } from "@/lib/subwayLines";
import { SubwayStation } from "@/lib/subwayStations";

function hexToRgb(hex: string, alpha = 255): [number, number, number, number] {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b, alpha];
}

interface Props {
  students: Student[];
  lines: SubwayLineFeature[];
  stations: SubwayStation[];
  visitedNodes: number[];
  currentTime: number;
  showVisited: boolean;
}

export function MapLayers({
  students,
  lines,
  stations,
  visitedNodes,
  currentTime,
  showVisited,
}: Props) {
  return [
    showVisited &&
      new ScatterplotLayer({
        id: "visited-nodes",
        data: visitedNodes
          .map((id) => stations.find((s) => String(s.id) === String(id)))
          .filter(Boolean),
        getPosition: (d) => [d.lng, d.lat],
        getFillColor: [255, 0, 0, 180],
        radiusMinPixels: 5,
        pickable: false,
      }),

    !showVisited &&
      new PathLayer({
        id: "subway-lines",
        data: lines,
        getPath: (d) => d.geometry.coordinates,
        getColor: () => [30, 144, 255, 160],
        getWidth: 4,
        widthUnits: "pixels",
        pickable: false,
      }),

    new ColumnLayer({
      id: "student-homes-3d",
      data: students.map((s) => ({
        position:
          Array.isArray(s.home) && s.home.length === 2 ? s.home : [0, 0],
        color: s.color,
      })), // ✅ stabilized input
      diskResolution: 4,
      radius: 50,
      elevationScale: 1,
      extruded: true,
      getPosition: (d) => d.position,
      getFillColor: (d) => hexToRgb(d.color, 180),
      pickable: false,
    }),

    new ScatterplotLayer({
      id: `student-trails-${currentTime}`,
      data: students.flatMap((student) =>
        getTrailPoints(student, currentTime).map((pos, i) => ({
          ...student,
          lat: pos[1],
          lng: pos[0],
          alpha: Math.max(60 - i * 6, 0),
        }))
      ),
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
      getTooltip: ({ object }: { object: { name?: string } }) =>
        object?.name ? `${object.name}` : null,
    }),

    new ColumnLayer({
      id: "school-marker",
      data: [{ position: [SCHOOL.lng, SCHOOL.lat] }],
      getPosition: (d) => d.position,
      diskResolution: 6,
      getFillColor: [0, 0, 0, 200],
      radius: 200,
      elevationScale: 1,
      extruded: true,
      pickable: false,
    }),
  ].filter(Boolean);
}
