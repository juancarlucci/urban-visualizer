//* TimelineControls.tsx
//* UI panel for controlling animation state and settings like routing algorithm.

import { ChangeEvent } from "react";

export default function TimelineControls({
  children,
  isPlaying,
  onPlayPause,
  onReverse,
  currentTime,
  onTimeChange,
  isReverse,
}: {
  children?: React.ReactNode;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReverse: () => void;
  currentTime: number;
  onTimeChange: (t: number) => void;
  isReverse: boolean;
}) {
  const handleRangeInteraction = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onTimeChange(parseFloat(e.target.value));
  };

  return (
    <div
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-xl bg-white/90 p-4 rounded shadow space-y-2"
      style={{ pointerEvents: "auto" }} // Ensure controls are interactive
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center gap-2">
        <button
          onClick={onPlayPause}
          className="bg-gray-800 text-white px-4 py-2 rounded shadow"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <span className="text-sm font-medium text-gray-700">
          Time: <span>{formatTime(currentTime, isReverse)}</span>
        </span>
        <button
          onClick={onReverse}
          className="bg-gray-800 text-white px-4 py-2 rounded shadow"
        >
          Reverse
        </button>
      </div>
      <div className="slider-wrapper" style={{ pointerEvents: "auto" }}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={currentTime}
          onChange={handleRangeInteraction}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full cursor-pointer"
          style={{ pointerEvents: "auto" }} // Ensure slider is interactive
        />
        {children}
      </div>
    </div>
  );
}

function formatTime(currentTime: number, isReverse: boolean): string {
  const hourBase = isReverse ? 15 : 6;
  const hour = Math.floor(currentTime * 3) + hourBase;
  const minutes = Math.floor((currentTime * 3 * 60) % 60);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}
