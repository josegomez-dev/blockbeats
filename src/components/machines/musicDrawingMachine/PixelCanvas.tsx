'use client';

import React, { useEffect, useRef, useState } from 'react';
import { notes } from '../../../utils/constants/musicDrawingMachine';

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
  notesPlayed?: { noteIndex: number; time: number }[]; // 💡 Notes played info
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({
  colorMap,
  playingIndex,
  color,
  onCanvasClick,
  cols = 24, // ✅ Default to 24 if not provided
  fullscreen = false, // ✅ Default to false
  notesPlayed = [], // ✅ Default to empty array
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rows = notes.length;
  const cellSize = fullscreen ? 20 : 12.3; // 🎯 Bigger canvas in fullscreen

  const [canvasWidth, setCanvasWidth] = useState(cols * cellSize);

  // Calculate statistics for the right sidebar
  const totalNotesPlayed = notesPlayed.length;
  const uniqueNotesPlayed = new Set(notesPlayed.map(note => note.noteIndex)).size;
  const uniqueColorsUsed = new Set(colorMap.map(color => color.color)).size;
  const totalStepsUsed = new Set(notesPlayed.map(note => note.time)).size;

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
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* Note Labels Sidebar */}
      <div
        style={{
          width: '50px',
          height: rows * cellSize,
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #444',
          borderRight: '2px solid #00ffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          left: 0,
          zIndex: 10,
        }}
      >
        {/* Note Labels */}
        {notes.map(([noteName, frequency], index) => {
          const isBlackKey = noteName.includes('#');
          return (
            <div
              key={index}
              style={{
                height: cellSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #333',
                background: isBlackKey ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: fullscreen ? '11px' : '9px',
                  color: isBlackKey ? '#ff6b6b' : '#fff',
                  fontWeight: isBlackKey ? 'bold' : 'normal',
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {noteName}
              </div>
              {/* Frequency indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  fontSize: '6px',
                  color: '#666',
                }}
              >
                {Math.round(frequency)}Hz
              </div>
            </div>
          );
        })}
      </div>

      {/* Canvas */}
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

      {/* Info Panel - Right Side */}
      <div
        style={{
          width: '80px',
          height: rows * cellSize,
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #444',
          borderLeft: '2px solid #00ffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          right: 0,
          zIndex: 10,
        }}
      >
        {/* Octave Range Header */}
        <div
          style={{
            padding: '6px 4px',
            background: 'rgba(0, 255, 255, 0.1)',
            borderBottom: '1px solid #00ffff',
            textAlign: 'center',
            height: '35px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              color: '#00ffff',
              fontWeight: 'bold',
              lineHeight: 1.1,
            }}
          >
            C3-B4
          </div>
          <div
            style={{
              fontSize: '7px',
              color: '#aaa',
              marginTop: '1px',
            }}
          >
            2 Octaves
          </div>
        </div>

        {/* Notes Played Info */}
        <div
          style={{
            padding: '6px 4px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderBottom: '1px solid #ff6b6b',
            textAlign: 'center',
            height: '35px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              color: '#ff6b6b',
              fontWeight: 'bold',
              lineHeight: 1.1,
            }}
          >
            {totalNotesPlayed} Notes
          </div>
          <div
            style={{
              fontSize: '7px',
              color: '#aaa',
              marginTop: '1px',
            }}
          >
            {uniqueNotesPlayed} Unique
          </div>
        </div>

        {/* Colors Used Info */}
        <div
          style={{
            padding: '6px 4px',
            background: 'rgba(255, 142, 83, 0.1)',
            borderBottom: '1px solid #ff8e53',
            textAlign: 'center',
            height: '35px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              color: '#ff8e53',
              fontWeight: 'bold',
              lineHeight: 1.1,
            }}
          >
            {uniqueColorsUsed} Colors
          </div>
          <div
            style={{
              fontSize: '7px',
              color: '#aaa',
              marginTop: '1px',
            }}
          >
            Used
          </div>
        </div>

        {/* Steps Used Info */}
        <div
          style={{
            padding: '6px 4px',
            background: 'rgba(156, 39, 176, 0.1)',
            borderBottom: '1px solid #9c27b0',
            textAlign: 'center',
            height: '35px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              color: '#9c27b0',
              fontWeight: 'bold',
              lineHeight: 1.1,
            }}
          >
            {totalStepsUsed} Steps
          </div>
          <div
            style={{
              fontSize: '7px',
              color: '#aaa',
              marginTop: '1px',
            }}
          >
            Active
          </div>
        </div>
        
        {/* Empty space to fill remaining height */}
        <div
          style={{
            flex: 1,
            background: 'rgba(0, 255, 255, 0.02)',
          }}
        />
      </div>
    </div>

  );
};

export default PixelCanvas;
