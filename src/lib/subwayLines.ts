//* src/lib/subwayLines.ts
//* Loads and parses the NYC subway line GeoJSON file. Used to render subway routes and build the graph.


export interface SubwayLineFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    id?: string;
    name?: string;
    color?: string; // hex if available
  };
}

export type SubwayLine = SubwayLineFeature;

export async function loadSubwayLines(): Promise<SubwayLineFeature[]> {
  const res = await fetch("/api/subway-lines");
  const json = await res.json();
  return Array.isArray(json.features) ? json.features : [];
}
