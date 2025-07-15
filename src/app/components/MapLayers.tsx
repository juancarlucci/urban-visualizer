//* MapLayers.tsx
//* This component defines all Deck.GL layers for rendering subway lines, student routes, homes, and the school.
//* It promotes separation of concerns by isolating map visuals from map logic.

import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { Student } from "@/lib/studentsStore";
import { getAnimatedPosition, getTrailPoints } from "@/lib/animate";
import { SCHOOL } from "@/lib/constants";
import type { SubwayLineFeature } from "@/lib/subwayLines";
import { SubwayStation } from "@/lib/subwayStations";

//* Converts a hex color like "#ff0000" into an [R, G, B, A] array for Deck.GL fill styling
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
  debugEdges?: [number, number][][];
}

//* Main export: returns an array of Deck.GL layers to be rendered in <DeckGL />
export function MapLayers({
  students,
  lines,
  stations,
  visitedNodes,
  currentTime,
  debugEdges = [],
}: Props) {
  return [
    new ScatterplotLayer({
      id: "visited-nodes",
      data: visitedNodes
        .map((id) => stations.find((s) => String(s.id) === String(id)))
        .filter(Boolean),
      getPosition: (d) => [d.lng, d.lat],
      getFillColor: [255, 0, 0, 80], // dark red, semi-transparent
      radiusMinPixels: 3,
      pickable: false,
    }),
    //* Debug edges for visualization, shown as thin gray paths
    new PathLayer({
      id: "debug-edges",
      data: debugEdges,
      getPath: (d) => d,
      getColor: [120, 120, 120],
      widthMinPixels: 1,
      pickable: false,
    }),
    //* Debug edges for visualization, shown as gray dots
    new ScatterplotLayer({
      id: "visited-paths",
      data: students.flatMap(
        (s) => s.visitedPath?.map((coord) => ({ position: coord })) || []
      ),
      radiusMinPixels: 2,
      getFillColor: [150, 150, 150, 80],
      pickable: false,
    }),
    //* Visited paths of students, shown as tiny faded gray dots
    new ScatterplotLayer({
      id: `visited-paths-${currentTime}`,
      data: students.flatMap((s) => s.visitedPath || []),
      getPosition: (d) => d,
      getFillColor: [200, 200, 200, 80],
      getRadius: 20,
      radiusUnits: "meters",
      pickable: false,
    }),
    //* Subway network paths
    new PathLayer({
      id: "subway-lines",
      data: lines, // Array of subway line features. Data looks like: { geometry: { coordinates: [[lng, lat], ...] } }
      getPath: (d) => d.geometry.coordinates,
      getWidth: 4,
      getColor: () => [30, 144, 255, 160],
      widthUnits: "pixels",
      pickable: true,
    }),
    //* Student homes (fixed points)
    new ScatterplotLayer({
      id: "student-homes",
      data: students,
      getPosition: (d) => d.route?.[0] ?? [d.lng, d.lat],
      getFillColor: (d) => hexToRgb(d.color, 100),
      getRadius: 60,
      radiusUnits: "meters",
      pickable: false,
    }),
    //* Trail effect behind each student, with fading opacity for motion blur
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
    //* Main animated student dot, updated every frame
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
    //* School location icon (fixed black dot)
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
}
