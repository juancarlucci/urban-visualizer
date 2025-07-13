import StudentTimelineMap from "./components/StudentTimelineMap";

export default function HomePage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Urban Visualizer</h1>
      <StudentTimelineMap />

      {/* Concept Reference Table */}
      <section className="bg-gray-800 p-4 rounded-lg text-sm overflow-auto">
  <h2 className="text-xl font-semibold mb-2">🧠 Concept Breakdown</h2>
  <div className="max-w-full overflow-x-auto rounded border border-gray-300 bg-black text-white">
    <pre className="whitespace-pre font-mono text-xs p-4 min-w-[500px]">
<code>
{`| Concept          | Explanation                                                  |
|------------------|--------------------------------------------------------------|
| MapContainer     | React wrapper around Leaflet’s core map instance             |
| TileLayer        | Loads base map tiles (OpenStreetMap, Mapbox, etc.)           |
| Marker + Popup   | UI overlays to show clickable markers with info popups       |
| L.Icon.Default   | Manual fix to show markers in modern JS bundlers             |
| 'use client'     | Ensures this component renders only on the client (browser)  |`}
</code>
    </pre>
  </div>
</section>

    </main>
  );
}
