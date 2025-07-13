// File: lib/generateStudents.ts

import { Student } from "./studentsStore";
import { SubwayStation } from "./subwayStations";
import { loadSubwayLines } from "./subwayLines";
import { buildSubwayGraph, findShortestPath } from "./subwayGraph";
import { findNearestStation } from "./geoUtils";
import { SCHOOL } from "./constants";

const boroughBounds = {
  bronx: { lat: [40.82, 40.9], lng: [-73.93, -73.85] },
  queens: { lat: [40.73, 40.77], lng: [-73.87, -73.75] },
  brooklyn: { lat: [40.65, 40.7], lng: [-74.02, -73.85] },
  harlem: { lat: [40.79, 40.82], lng: [-73.97, -73.93] },
};

const modes = ["walk", "bike", "car", "subway"] as const;
const colors = ["#e63946", "#457b9d", "#2a9d8f", "#f4a261", "#e9c46a"];
const startDelay = Math.random() * 0.2;

export async function generateRandomStudents(
  stations: SubwayStation[],
  count = 13
): Promise<Student[]> {
  console.log("📊 Loaded stations:", stations.length);
  console.log("📍 First few stations:", stations.slice(0, 3));
  const students: Student[] = [];
  const lines = await loadSubwayLines();
  const graph = buildSubwayGraph(stations, lines);

  console.log("📊 Loaded stations:", stations.length);
  console.log("🏫 School location:", SCHOOL);
  console.log("📍 First few stations:", stations.slice(0, 5));

  students.push({
    id: "roosevelt-1",
    name: "Roosevelt A",
    lat: 40.7616,
    lng: -73.9497,
    mode: "walk",
    speed: 1,
    color: "#d7263d",
    route: [
      [-73.9497, 40.7616],
      [SCHOOL.lng, SCHOOL.lat],
    ],
    startDelay: Math.random() * 0.2,
  });

  for (let i = 0; i < count; i++) {
    const boroughKeys = Object.keys(
      boroughBounds
    ) as (keyof typeof boroughBounds)[];
    const borough = boroughKeys[Math.floor(Math.random() * boroughKeys.length)];
    const { lat, lng } = boroughBounds[borough];

    // const mode = modes[Math.floor(Math.random() * modes.length)];
    const mode = "subway";
    const speed = { walk: 1, bike: 3, subway: 4, car: 2.5 }[mode];

    const studentLat = randomBetween(lat[0], lat[1]);
    const studentLng = randomBetween(lng[0], lng[1]);
    const home: [number, number] = [studentLng, studentLat];

    const startStation = findNearestStation(home, stations);
    const endStation = findNearestStation([SCHOOL.lng, SCHOOL.lat], stations);

    if (!startStation || !endStation) {
      console.warn(`❌ Missing station for s-${i}`, {
        home,
        school: [SCHOOL.lng, SCHOOL.lat],
        startStation,
        endStation,
      });
    }

    let route: [number, number][] = [];

    if (
      mode === "subway" &&
      startStation?.id !== undefined &&
      endStation?.id !== undefined
    ) {
      const path = findShortestPath(graph, startStation.id, endStation.id);
      if (path.length >= 2) {
        route = [
          home,
          ...path.map((s) => s.coordinates),
          [SCHOOL.lng, SCHOOL.lat],
        ]; //* Ensure route includes home and school. ...path.map is
      } else {
        console.warn(`⚠️ Fallback route for s-${i}`);
        route = [startStation.coordinates, endStation.coordinates];
      }
    } else {
      route = [home, [SCHOOL.lng, SCHOOL.lat]];
    }

    students.push({
      id: `s-${i}`,
      name: `Student ${i + 1}`,
      lat: studentLat,
      lng: studentLng,
      mode,
      speed,
      color: colors[i % colors.length],
      route,
      startDelay,
    });
  }

  return students;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
