import React from "react";

interface Props {
  algorithm: "astar" | "dijkstra";
  setAlgorithm: (algo: "astar" | "dijkstra") => void;
  showVisited: boolean;
  setShowVisited: (v: boolean) => void;
}

export default function AlgorithmControls({
  algorithm,
  setAlgorithm,
  showVisited,
  setShowVisited,
}: Props) {
  return (
    <div className="flex gap-2 items-center justify-between text-sm text-gray-800">
      <div>
        <label className="mr-2 font-medium">Routing:</label>
        <select
          className="bg-gray-800 text-white px-3 py-1 rounded"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as "astar" | "dijkstra")}
        >
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
        </select>
      </div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showVisited}
          onChange={() => setShowVisited((prev) => !prev)}
        />
        <span>Show visited nodes</span>
      </label>
    </div>
  );
}
