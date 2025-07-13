import { Student } from "./studentsStore";
import { findNearestStation } from "./geoUtils";
import { buildSubwayGraph, findShortestPath } from "./subwayGraph";
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
  stations: SubwayStation[]
): Promise<Student[]> {
  if (!Array.isArray(stations) || stations.length === 0) {
    console.error(
      "❌ Invalid or empty station list passed to generateRandomStudents"
    );
    return [];
  }

  const students: Student[] = [];
  const lines = await loadSubwayLines();
  const graph = buildSubwayGraph(stations, lines);

  // Create a properly routed subway student "Alex"
  const alexHome: [number, number] = [-73.9497, 40.7616];
  const alexStart = findNearestStation(alexHome, stations);
  const alexEnd = findNearestStation([SCHOOL.lng, SCHOOL.lat], stations);
  let alexRoute: [number, number][] = [alexHome, [SCHOOL.lng, SCHOOL.lat]];

  if (alexStart && alexEnd) {
    const path = findShortestPath(graph, alexStart.id, alexEnd.id);
    if (path.length > 0) {
      alexRoute = [
        alexHome,
        ...path.map((s) => s.coordinates),
        [SCHOOL.lng, SCHOOL.lat],
      ];
    }
  }

  students.push({
    id: "alex-1",
    name: "Alex",
    lat: alexHome[1],
    lng: alexHome[0],
    mode: "subway",
    speed: 1,
    color: "#d7263d",
    route: alexRoute,
    startDelay: Math.random() * 0.2,
    isFixed: false,
  });

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
      const path = findShortestPath(graph, startStation.id, endStation.id);
      if (path.length >= 2) {
        route = [
          home,
          ...path.map((station) => station.coordinates),
          [SCHOOL.lng, SCHOOL.lat],
        ];
      } else {
        route = [home, [SCHOOL.lng, SCHOOL.lat]];
      }
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
      mode: "subway",
      speed: 1,
      color: colors[students.length % colors.length],
      route,
      startDelay: Math.random() * 0.2,
      isFixed: false,
    });
  }

  return students;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
