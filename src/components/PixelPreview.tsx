import React from "react";

type Pixel = {
  noteIndex: number;
  time: number;
  color: string;
};

interface PixelPreviewProps {
  colorMap: Pixel[];
  size?: number;
  style?: React.CSSProperties;
  backgroundColor?: string;
}

const PixelPreview: React.FC<PixelPreviewProps> = ({
  colorMap,
  size = 100,
  style,
  backgroundColor,
}) => {
  if (!colorMap || colorMap.length === 0) return null;

  const maxTime = Math.max(...colorMap.map(p => p.time));
  const minNote = Math.min(...colorMap.map(p => p.noteIndex));
  const maxNote = Math.max(...colorMap.map(p => p.noteIndex));
  const noteRange = maxNote - minNote + 1;

  const rows = noteRange <= 12 ? 12 : 24;
  const cols = maxTime + 1;
  const scaleX = cols > rows ? rows / cols : 1;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        margin: "0 auto",
        backgroundColor: backgroundColor || "#000",
        border: "1px solid #333",
        borderRadius: "12px",
        boxShadow: "0 0 12px rgba(0, 255, 255, 0.3)",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          transform: `scaleX(${scaleX})`,
          transformOrigin: "left center",
          width: "100%",
          height: "100%",
        }}
      >
        {colorMap.map(({ noteIndex, time, color }, i) => (
          <div
            key={i}
            className="pixel-note"
            style={{
              gridColumn: time + 1,
              gridRow: noteIndex - minNote + 1,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelPreview;
