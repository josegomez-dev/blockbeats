'use client';

import React, { useEffect, useRef } from 'react';
import { notes } from './../utils/constants/musicDrawingMachine';

interface ColorMapItem {
  noteIndex: number;
  time: number;
  color: string;
}

interface PixelCanvasProps {
  colorMap: ColorMapItem[];
  playingIndex: number | null;
  color: string;
  onCanvasClick: (noteIndex: number, time: number) => void;
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({
  colorMap,
  playingIndex,
  color,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rows = notes.length;     // now 24
  const cols = 24;               // time steps
  const cellSize = 20;           // more space

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#444';
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, rows * cellSize);
      ctx.stroke();
    }

    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * cellSize);
      ctx.lineTo(cols * cellSize, j * cellSize);
      ctx.stroke();
    }

    // Fill colored notes
    for (const { noteIndex, time, color } of colorMap) {
      if (noteIndex >= 0 && noteIndex < rows && time >= 0 && time < cols) {
        ctx.fillStyle = color;
        ctx.fillRect(time * cellSize, noteIndex * cellSize, cellSize, cellSize);
      }
    }

    // Highlight playing column
    if (playingIndex !== null) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(playingIndex * cellSize, 0, cellSize, rows * cellSize);
    }
  }, [colorMap, playingIndex, cellSize]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const time = Math.floor(x / cellSize);
    const noteIndex = Math.floor(y / cellSize);

    onCanvasClick(noteIndex, time);
  };

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: 'auto', // scroll if needed
        maxHeight: rows * cellSize + 20,
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        width={cols * cellSize}
        height={rows * cellSize}
        style={{
          background: color,
          width: '100%',
          height: rows * cellSize - 287, // ensures visibility
          cursor: 'pointer',
          display: 'block',
        }}
        id="pixel-canvas"
      />
    </div>
  );
};

export default PixelCanvas;
