### 📘 NYC Student Routing Map Simulator

#### 🌟 Purpose

This project simulates 100,000 students commuting to school through NYC's subway system using real geospatial data. It demonstrates:

* Applied pathfinding algorithms (A\* and Dijkstra)
* Real-time spatial rendering via Deck.gl and Mapbox
* Performance state management with Zustand
* UI engineering and animation for user feedback
* System-level thinking for large-scale geospatial search

---

#### 🧠 Learning Goals

* Master geospatial A\*/Dijkstra on real subway graphs
* Visualize massive-scale data (100K routes, 500 shown)
* Optimize React + Zustand state architecture
* Animate student travel across a real-time timeline
* Prepare for system design discussions around:

  * Spatial indexes
  * Memoization and caching
  * Debug transparency for algorithms

---

#### 🛠️ Architecture Overview

| Layer            | Stack/Details                              |
| ---------------- | ------------------------------------------ |
| Frontend         | Next.js (App Router), TypeScript, Tailwind |
| Map Rendering    | Deck.GL + Mapbox                           |
| State Management | Zustand with useRef caching                |
| Graph Logic      | Custom A\*/Dijkstra using subway GeoJSON   |

---

#### 📂 Key Components

| File                     | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `StudentTimelineMap.tsx` | Controls timeline, routing logic, UI state            |
| `generateStudents.ts`    | Generates students' paths and visited nodes           |
| `subwayGraph.ts`         | Subway graph builder + pathfinding engine             |
| `MapLayers.tsx`          | Deck.GL render: subway, students, trails, debug paths |
| `TimelineControls.tsx`   | UI panel: algorithm toggle, time slider, play/pause   |
| `studentsStore.ts`       | Zustand store: time, selected students                |

---

#### 📊 Features

* **Routing algorithm toggle**: A\* vs Dijkstra
* **Animated travel simulation**: with fading trails
* **Subway visualization**: lines, homes, school
* **Live stats**: average visited nodes, routing mode
* **Time control**: 6 AM → 3 PM, or reverse

---

#### 🚀 Performance & UX

* Memo cache per algorithm via `useRef`
* Lazy-load first 500 students for speed
* Animate via frame-based requestAnimationFrame
* Toggleable debug edges to inspect algorithm output
* Smooth Deck.GL rendering with dynamic radius, color

---

#### 🔬 Future Enhancements

1. Persist full student routing cache (across toggles)
2. Add step-debug visualizer for algorithm progression
3. Viewport-based lazy rendering of visited paths
4. Enhanced tooltips with student metrics
5. Build out system design doc (caching, clustering, quadtree)

---

#### 🛠️ Tech Stack

* `Next.js` (App Router)
* `TypeScript`
* `Zustand`
* `Deck.GL`, `Mapbox GL JS`
* `Tailwind CSS`

---

For questions, demos, or walk-throughs, see `StudentTimelineMap.tsx` or run `npm run dev` with your Mapbox token. 
