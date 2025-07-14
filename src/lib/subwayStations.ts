//* File: src/lib/subwayStations.ts
//* Defines subway station data structure and functions to load subway station data from GeoJSON.

export type SubwayStation = {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
};

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
