// components/Piano.tsx
'use client';

import React from 'react';
import Key from './Key';
import { KeyType, notes } from './../utils/constants/musicDrawingMachine';

interface PianoProps {
  onNotePlay: (noteIndex: number) => void;
}

const Piano: React.FC<PianoProps> = ({ onNotePlay }) => {
  return (
    <div
      style={{
        position: 'relative',
        height: '200px',
        marginTop: '5px',
        overflowX: 'auto', // Enable horizontal scroll
        whiteSpace: 'nowrap',
        paddingBottom: '10px',
      }}
    >
      {notes.map(([note, freq, type], i) => (
        <div key={note} style={{ display: 'inline-block' }}>
          <Key
            note={note}
            frequency={freq}
            type={type as KeyType}
            onPlay={() => onNotePlay(i)}
          />
        </div>
      ))}
    </div>
  );
};

export default Piano;
