//* src/lib/generateStudents.ts
//* Generates random student data with routes based on subway stations and lines.
//* Core to simulating student movements in the subway system.

import { Student } from "./studentsStore";
import { findNearestStation } from "./geoUtils";
import {
  buildSubwayGraph,
  findShortestPath,
  findShortestPathAstar,
} from "./subwayGraph";
import { loadSubwayLines } from "./subwayLines";
import { SCHOOL } from "./constants";
import { SubwayStation } from "./subwayStations";

const boroughBounds = {
  bronx: { lat: [40.82, 40.9], lng: [-73.93, -73.85] },
  queens: { lat: [40.73, 40.77], lng: [-73.87, -73.75] },
  brooklyn: { lat: [40.65, 40.7], lng: [-74.02, -73.85] },
};

const colors = ["#e63946", "#457b9d", "#2a9d8f", "#f4a261", "#e9c46a"];
const boroughNamePool = {
  bronx: [
    "Jayden Torres",
    "Sofia Rivera",
    "Aarav Patel",
    "Elijah Johnson",
    "Mia Chen",
  ],
  queens: ["Sophia Zhang", "Liam Kim", "Isabella Nguyen", "Daniel Gonzalez"],
  brooklyn: ["Ethan Cohen", "Olivia Park", "Noah Jackson"],
};

export async function generateRandomStudents(
  count = 13,
  stations: SubwayStation[],
  algorithm: "dijkstra" | "astar" = "dijkstra" // default to Dijkstra unless specified
): Promise<{ students: Student[]; debugEdges: [number, number][][] }> {
  if (!Array.isArray(stations) || stations.length === 0) {
    console.error(
      "❌ Invalid or empty station list passed to generateRandomStudents"
    );
    return { students: [], debugEdges: [] };
  }

  const students: Student[] = [];
  const sampledStudents = students
    .sort(() => 0.5 - Math.random())
    .slice(0, 500);
  const lines = await loadSubwayLines();
  const { graph, debugEdges } = buildSubwayGraph(stations, lines);

  // Create a properly routed subway student "Alex"
  const alexHome: [number, number] = [-73.9497, 40.7616];
  const alexStart = findNearestStation(alexHome, stations);
  const alexEnd = findNearestStation([SCHOOL.lng, SCHOOL.lat], stations);
  let alexRoute: [number, number][] = [alexHome, [SCHOOL.lng, SCHOOL.lat]];

  if (alexStart && alexEnd) {
    const [alexPath, alexVisited] =
      algorithm === "astar"
        ? findShortestPathAstar(graph, alexStart.id, alexEnd.id)
        : findShortestPath(graph, alexStart.id, alexEnd.id);
    if (alexPath.length > 0) {
      alexRoute = [
        alexHome,
        ...alexPath.map((s) => s.coordinates),
        [SCHOOL.lng, SCHOOL.lat],
      ];
    }
    students.push({
      id: "alex-1",
      name: "Alex",
      lat: alexHome[1],
      lng: alexHome[0],
      speed: 1,
      color: "#d7263d",
      route: alexRoute,
      startDelay: Math.random() * 0.2,
      isFixed: false,
      visitedPath: alexVisited.map((s) => s.coordinates),
      home: alexHome,
    });
  }

  const boroughs = Object.keys(boroughBounds) as (keyof typeof boroughBounds)[];

  while (students.length < count + 1) {
    const borough = boroughs[Math.floor(Math.random() * boroughs.length)];
    const { lat, lng } = boroughBounds[borough];
    const studentLat = randomBetween(lat[0], lat[1]);
    const studentLng = randomBetween(lng[0], lng[1]);
    const home: [number, number] = [studentLng, studentLat];

    const startStation = findNearestStation(home, stations);
    const endStation = findNearestStation([SCHOOL.lng, SCHOOL.lat], stations);
    let route: [number, number][] = [];

    if (startStation && endStation) {
      const [path, visited] =
        algorithm === "astar"
          ? findShortestPathAstar(graph, startStation.id, endStation.id)
          : findShortestPath(graph, startStation.id, endStation.id);

      if (path.length >= 2) {
        route = [
          home,
          ...path.map(
            (station: { coordinates: [number, number] }) => station.coordinates
          ),
          [SCHOOL.lng, SCHOOL.lat],
        ];
      } else {
        route = [home, [SCHOOL.lng, SCHOOL.lat]];
      }

      const pool = boroughNamePool[borough];
      const name = pool[Math.floor(Math.random() * pool.length)];

      students.push({
        id: `s-${students.length - 1}`,
        name,
        lat: studentLat,
        lng: studentLng,
        speed: 1,
        color: colors[students.length % colors.length],
        route,
        startDelay: Math.random() * 0.2,
        isFixed: false,
        visitedPath: visited.map((s) => s.coordinates),
        home,
      });
    }
  }

  return { students, debugEdges };
}
export function generateInitialStudents(
  stations: SubwayStation[],
  algorithm: "astar" | "dijkstra"
): Promise<{
  students: Student[];
  debugEdges: [number, number][][];
}> {
  return generateRandomStudents(15, stations, algorithm);
}

export function generateFullStudentSet(
  stations: SubwayStation[],
  algorithm: "astar" | "dijkstra"
): Promise<{
  students: Student[];
  debugEdges: [number, number][][];
}> {
  return generateRandomStudents(5000, stations, algorithm);
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
