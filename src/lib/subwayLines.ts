//* src/lib/subwayLines.ts

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
