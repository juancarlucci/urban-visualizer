//* geoUtils.ts
//* Utility functions for geographic operations like finding the nearest subway station to a given coordinate. 
//* Supports student routing logic.

import { SubwayStation } from "./subwayStations";

export function findNearestStation(
  point: [number, number],
  stations: SubwayStation[]
): SubwayStation {
  return stations.reduce((nearest, station) => { //* nearest looks like: { id: string, name: string, coordinates: [number, number] }
    const dist = distance(point, station.coordinates); //* Data looks like thie: Point: [lng, lat], station.coordinates: [number, number]. 
    const best = distance(point, nearest.coordinates); 
    return dist < best ? station : nearest; 
  }, stations[0]);
}

function distance(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
): number {
  return Math.hypot(lng1 - lng2, lat1 - lat2);
}