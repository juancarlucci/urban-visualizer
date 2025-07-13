import { SubwayStation } from "./subwayStations";

export function findNearestStation(
  point: [number, number],
  stations: SubwayStation[]
): SubwayStation {
  return stations.reduce((nearest, station) => {
    const dist = distance(point, station.coordinates);
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