import StudentTimelineMap from "./components/StudentTimelineMap";

export default function HomePage() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Urban Visualizer</h1>
      <StudentTimelineMap />
    </main>
  );
}
