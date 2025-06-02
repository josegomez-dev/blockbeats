// components/Piano.tsx
'use client';

import React from 'react';
import Key from './Key';
import { notes } from './../utils/constants/musicDrawingMachine'; // Update path as needed

interface PianoProps {
  onNotePlay: (noteIndex: number) => void;
  ctx: AudioContext | null;
}

const Piano: React.FC<PianoProps> = ({ onNotePlay, ctx }) => {
  return (
    <div style={{ position: 'relative', height: '200px' }}>
      {notes.map(([note, freq, type], i) => (
        <Key
          key={note}
          note={note}
          frequency={freq}
          type={type}
          onPlay={() => onNotePlay(i)}
          ctx={ctx}
        />
      ))}
    </div>
  );
};

export default Piano;
