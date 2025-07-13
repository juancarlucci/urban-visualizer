//* File: src/lib/subwayStations.ts

export type SubwayStation = {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
};

interface SubwayStationFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    objectid: number;
    name: string;
  };
}

function isValidStationFeature(
  feature: unknown
): feature is SubwayStationFeature {
  if (
    typeof feature === "object" &&
    feature !== null &&
    "geometry" in feature &&
    "properties" in feature
  ) {
    const f = feature as any;
    return (
      f.geometry?.type === "Point" &&
      Array.isArray(f.geometry.coordinates) &&
      typeof f.geometry.coordinates[0] === "number" &&
      typeof f.geometry.coordinates[1] === "number" &&
      typeof f.properties?.objectid === "number" &&
      typeof f.properties?.name === "string"
    );
  }
  return false;
}

export async function loadSubwayStations(): Promise<SubwayStation[]> {
  const res = await fetch("/api/subway-stations");
  const json = await res.json();
  console.log("✅ Fetched station data:", json.features.length);
  console.log("🧪 First 3 raw features:", json.features.slice(0, 3));

  if (!Array.isArray(json.features)) {
    console.error("Invalid subway station GeoJSON", json);
    return [];
  }
  return json.features
    .filter(
      (f) =>
        f.geometry?.type === "Point" && Array.isArray(f.geometry.coordinates)
    )
    .map(
      (
        f: { properties: { name: any }; geometry: { coordinates: any } },
        index: any
      ) => ({
        id: `station-${index}`,
        name: f.properties?.name ?? `Station ${index}`,
        coordinates: f.geometry.coordinates,
      })
    );
}
