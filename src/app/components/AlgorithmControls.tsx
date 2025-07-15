import React from "react";

interface Props {
  algorithm: "astar" | "dijkstra";
  setAlgorithm: (algo: "astar" | "dijkstra") => void;
  // showVisited: boolean;
  // setShowVisited: (v: boolean) => void;
  isLoading: boolean;
  studentCount: number;
  totalVisited: number;
}

export default function AlgorithmControls({
  algorithm,
  setAlgorithm,
  // showVisited,
  // setShowVisited,
  isLoading,
  studentCount,
  totalVisited,
}: Props) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
        <label className="font-medium">Routing:</label>
        <select
          className="bg-gray-800 text-white px-3 py-1 rounded"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as "astar" | "dijkstra")}
        >
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
        </select>
        {/* <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showVisited}
            onChange={(e) => setShowVisited(e.target.checked)}
          />
          <span>Show visited</span>
        </label> */}
        <div className="text-sm text-gray-800 text-right">
          Routing with: {algorithm.toUpperCase()} <br />
          {isLoading || studentCount === 0
            ? "Calculating paths..."
            : `Avg. visited nodes: ${(totalVisited / studentCount).toFixed(1)}`}
        </div>
      </div>
    </div>
  );
}
