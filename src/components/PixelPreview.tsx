// components/PixelPreview.tsx
import React from "react";

type Pixel = {
  noteIndex: number;
  time: number;
  color: string;
};

interface PixelPreviewProps {
  colorMap: Pixel[];
  notesCount: number;
  size?: number;
  style?: React.CSSProperties;
}

const PixelPreview: React.FC<PixelPreviewProps> = ({ colorMap, notesCount, size = 100, style }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        margin: "0 auto",
        backgroundColor: colorMap ? colorMap[0]?.color || "black" : 'red',
        border: "1px solid gray",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        gridGap: "1px",
        gridAutoFlow: "column",
        gridAutoColumns: "1fr",
        gridAutoRows: "1fr",
        display: "grid",
        gridTemplateRows: `repeat(${(notesCount / 2) -5}, 1fr)`,
        overflow: "hidden",
        ...style,
      }}
    >
      {colorMap && colorMap.map(({ noteIndex, time, color }, i) => (
        <div
          key={i}
          style={{
            gridColumn: time + 1,
            gridRow: noteIndex + 1,
            backgroundColor: color,
            width: "100%",
            height: "100%",
          }}
        />
      ))}
    </div>
  );
};

export default PixelPreview;
