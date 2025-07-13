// File: src/lib/subwayGraph.ts

import { SubwayStation } from "./subwayStations";
import { SubwayLine } from "./subwayLines";

export type SubwayGraph = Map<string, SubwayGraphNode>;

export interface SubwayGraphNode {
  station: SubwayStation;
  neighbors: { stationId: string; weight: number }[];
}

export function buildSubwayGraph(
  stations: SubwayStation[],
  lines: SubwayLine[]
): SubwayGraph {
  const graph: SubwayGraph = new Map();

  for (const station of stations) {
    graph.set(station.id, { station, neighbors: [] });
  }

  for (const line of lines) {
    const coords = line.geometry.coordinates;

    for (let i = 0; i < coords.length - 1; i++) {
      const startCoord = coords[i];
      const endCoord = coords[i + 1];

      const start = findNearestStation(startCoord, stations);
      const end = findNearestStation(endCoord, stations);

      if (!start || !end || start.id === end.id) continue;

      const weight = distance(start.coordinates, end.coordinates);
      graph.get(start.id)?.neighbors.push({ stationId: end.id, weight });
      graph.get(end.id)?.neighbors.push({ stationId: start.id, weight });
    }
  }

  return graph;
}

export function findShortestPath(
  graph: SubwayGraph,
  startId: string,
  endId: string
): SubwayStation[] {
  const visited = new Set<string>();
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const queue: { id: string; dist: number }[] = [];

  for (const node of graph.values()) {
    distances.set(node.station.id, Infinity);
    previous.set(node.station.id, null);
  }

  distances.set(startId, 0);
  queue.push({ id: startId, dist: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { id: currentId } = queue.shift()!;

    if (currentId === endId) break;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = graph.get(currentId);
    if (!currentNode) continue;

    for (const neighbor of currentNode.neighbors) {
      const alt = (distances.get(currentId) ?? Infinity) + neighbor.weight;
      if (alt < (distances.get(neighbor.stationId) ?? Infinity)) {
        distances.set(neighbor.stationId, alt);
        previous.set(neighbor.stationId, currentId);
        queue.push({ id: neighbor.stationId, dist: alt });
      }
    }
  }

  const path: SubwayStation[] = [];
  let currentId: string | null = endId;
  while (currentId) {
    const node = graph.get(currentId);
    if (node) path.unshift(node.station);
    currentId = previous.get(currentId) ?? null;
  }

  return path;
}

function distance(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function findNearestStation(
  coord: [number, number],
  stations: SubwayStation[]
): SubwayStation | undefined {
  let minDist = Infinity;
  let nearest: SubwayStation | undefined = undefined;

  for (const s of stations) {
    const d = distance(s.coordinates, coord);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }

  return nearest;
}
