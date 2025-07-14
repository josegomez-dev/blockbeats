'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  cols?: number; // 💡 Make cols customizable
  fullscreen?: boolean; // 💡 NEW prop
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({
  colorMap,
  playingIndex,
  color,
  onCanvasClick,
  cols = 24, // ✅ Default to 24 if not provided
  fullscreen = false, // ✅ Default to false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rows = notes.length;
  const cellSize = fullscreen ? 20 : 12.3; // 🎯 Bigger canvas in fullscreen

  const [canvasWidth, setCanvasWidth] = useState(cols * cellSize);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = cols * cellSize * dpr;
    canvas.height = rows * cellSize * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, cols * cellSize, rows * cellSize);
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

    for (const { noteIndex, time, color } of colorMap) {
      if (noteIndex >= 0 && noteIndex < rows && time >= 0 && time < cols) {
        ctx.fillStyle = color;
        ctx.fillRect(time * cellSize, noteIndex * cellSize, cellSize, cellSize);
      }
    }

    if (playingIndex !== null) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(playingIndex * cellSize, 0, cellSize, rows * cellSize);
    }
  }, [colorMap, playingIndex, cols, canvasWidth, cellSize]);


  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Handle device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cols * cellSize * dpr;
    canvas.height = rows * cellSize * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, cols * cellSize, rows * cellSize);
    ctx.strokeStyle = '#444';

    // Draw grid
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

    // Fill notes
    for (const { noteIndex, time, color } of colorMap) {
      if (noteIndex >= 0 && noteIndex < rows && time >= 0 && time < cols) {
        ctx.fillStyle = color;
        ctx.fillRect(time * cellSize, noteIndex * cellSize, cellSize, cellSize);
      }
    }

    // Highlight playing
    if (playingIndex !== null) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(playingIndex * cellSize, 0, cellSize, rows * cellSize);
    }
  }, [colorMap, playingIndex, cols, canvasWidth]);

  // Click handler
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Get mouse position adjusted to device pixel ratio
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const time = Math.floor(x / cellSize);
    const noteIndex = Math.floor(y / cellSize);

    onCanvasClick(noteIndex, time);
  };


  return (
    <div
      ref={containerRef}
      style={{
        borderRadius: 8,
        overflow: 'auto',
        maxHeight: rows * cellSize + 20,
        width: '100%',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{
          background: color,
          width: cols * cellSize,
          height: rows * cellSize,
          cursor: 'pointer',
          display: 'block',
        }}
        id="pixel-canvas"
      />
    </div>

  );
};

export default PixelCanvas;
