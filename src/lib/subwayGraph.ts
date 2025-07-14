//* File: src/lib/subwayGraph.ts
//* Constructs a graph from subway stations and lines to calculate shortest paths.
//* Now supports both Dijkstra and A* (heuristic) algorithms for flexible pathfinding.

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
): { graph: SubwayGraph; debugEdges: [number, number][][] } {
  const graph: SubwayGraph = new Map();
  const debugEdges: [number, number][][] = [];

  //* Initialize graph with all stations, ensuring each has valid properties
  for (const station of stations) {
    //* Improvement: Validate station properties to catch invalid data early
    if (!station.id || !station.coordinates) {
      console.warn(`Skipping invalid station: ${JSON.stringify(station)}`);
      continue;
    }
    graph.set(station.id, { station, neighbors: [] });
  }

  for (const line of lines) {
    //* Improvement: Validate line geometry to prevent processing invalid lines
    if (!line.geometry?.coordinates?.length) {
      console.warn(`Skipping invalid line: ${JSON.stringify(line)}`);
      continue;
    }

    const coords = line.geometry.coordinates;

    for (let i = 0; i < coords.length - 1; i++) {
      const startCoord = coords[i];
      const endCoord = coords[i + 1];

      const start = findNearestStation(startCoord, stations);
      const end = findNearestStation(endCoord, stations);

      //* Skip if stations are invalid or identical
      if (!start || !end || start.id === end.id) continue;

      debugEdges.push([start.coordinates, end.coordinates]);

      //* Calculate edge weight using Euclidean distance
      const weight = distance(start.coordinates, end.coordinates);

      //* Improvement: Explicitly check for start node existence and prevent duplicate edges
      const startNode = graph.get(start.id);
      if (!startNode) {
        console.error(`Station ${start.id} not found in graph`);
        continue;
      }
      //* Only add edge if it doesn't already exist to avoid duplicates
      if (!startNode.neighbors.some((n) => n.stationId === end.id)) {
        startNode.neighbors.push({ stationId: end.id, weight });
      }

      //* Improvement: Explicitly check for end node existence and prevent duplicate edges
      const endNode = graph.get(end.id);
      if (!endNode) {
        console.error(`Station ${end.id} not found in graph`);
        continue;
      }
      //* Only add edge if it doesn't already exist to avoid duplicates
      if (!endNode.neighbors.some((n) => n.stationId === start.id)) {
        endNode.neighbors.push({ stationId: start.id, weight });
      }
    }
  }

  return { graph, debugEdges };
}

//* Dijkstra's Algorithm
//* Finds the shortest path between two stations in the subway graph.
//* Uses a priority queue to explore the graph efficiently.
export function findShortestPath(
  graph: SubwayGraph,
  startId: string,
  endId: string
): [SubwayStation[], SubwayStation[]] {
  const visited = new Set<string>();
  const distances = new Map<string, number>();
  //* Map to store the previous node for each station to reconstruct the path.
  const previous = new Map<string, string | null>();
  //* Priority queue to explore nodes with the smallest distance first.
  const queue: { id: string; dist: number }[] = [];

  //* Initialize distances and previous nodes so that all stations are set to Infinity except the start station.
  //* Using Array.from(graph.values()) converts the iterator to an array, which is explicitly iterable and avoids any potential runtime or TypeScript strict mode issues.
  for (const node of Array.from(graph.values())) { 
    distances.set(node.station.id, Infinity);
    previous.set(node.station.id, null);
  }

  //
  distances.set(startId, 0);
  queue.push({ id: startId, dist: 0 });

  //* While there are nodes to explore, continue the search.
  while (queue.length > 0) {
    //* Sort the queue by distance to always explore the closest node first.
    queue.sort((a, b) => a.dist - b.dist);

    const { id: currentId } = queue.shift()!;
    if (currentId === endId) break;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = graph.get(currentId);
    if (!currentNode) continue;

    //* Explore each neighbor of the current station and update distances.
    for (const neighbor of currentNode.neighbors) {
      const alt = (distances.get(currentId) ?? Infinity) + neighbor.weight; //* neighbor.weight
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

  return [path, Array.from(visited).map((id) => graph.get(id)!.station)];
}

//* A* Search Algorithm
export function findShortestPathAstar(
  graph: SubwayGraph,
  startId: string,
  endId: string
): [SubwayStation[], SubwayStation[]] {
  const openSet = new Set<string>([startId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>(); //* Stores the cost from start to a node.
  const fScore = new Map<string, number>(); //* Stores the estimated cost from start to end through a node.
  const visited = new Set<string>();

  for (const node of Array.from(graph.values())) {
  gScore.set(node.station.id, Infinity);
  fScore.set(node.station.id, Infinity);
}

  gScore.set(startId, 0);
  fScore.set(
    startId,
    heuristic(graph.get(startId)!.station, graph.get(endId)!.station)
  );

  while (openSet.size > 0) {
    //*
    const currentId = Array.from(openSet).reduce((a, b) =>
      (fScore.get(a) ?? Infinity) < (fScore.get(b) ?? Infinity) ? a : b
    );

    if (currentId === endId) break;
    openSet.delete(currentId);
    const currentNode = graph.get(currentId);
    if (!currentNode) continue;
    visited.add(currentId);

    for (const neighbor of currentNode.neighbors) {
      const tentativeG = (gScore.get(currentId) ?? Infinity) + neighbor.weight;
      if (tentativeG < (gScore.get(neighbor.stationId) ?? Infinity)) {
        cameFrom.set(neighbor.stationId, currentId);
        gScore.set(neighbor.stationId, tentativeG);
        fScore.set(
          neighbor.stationId,
          tentativeG +
            heuristic(
              graph.get(neighbor.stationId)!.station,
              graph.get(endId)!.station
            )
        );
        openSet.add(neighbor.stationId);
      }
    }
  }

  const path: SubwayStation[] = [];
  let currentId: string | null = endId;
  while (currentId && graph.has(currentId)) {
    path.unshift(graph.get(currentId)!.station);
    currentId = cameFrom.get(currentId) ?? null;
  }

  return [path, Array.from(visited).map((id) => graph.get(id)!.station)];
}

function heuristic(a: SubwayStation, b: SubwayStation): number {
  return distance(a.coordinates, b.coordinates);
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
