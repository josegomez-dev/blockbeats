'use client';

import React, { useEffect } from 'react';
import Key from './Key';
import { KeyType, notes, keyMap } from '../../../utils/constants/musicDrawingMachine';
import { playNote } from '@/utils/helpers/drumHelper';

interface PianoProps {
  onNotePlay: (noteIndex: number) => void;
}

const Piano: React.FC<PianoProps> = ({ onNotePlay }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const noteIndex = keyMap.findIndex(k => k.toUpperCase() === key);

      if (noteIndex !== -1) {
        const [, freq] = notes[noteIndex];
        playNote(freq);         // play the frequency
        onNotePlay(noteIndex);  // trigger any canvas or animation effect
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNotePlay]);

  return (
    <div
      style={{
        position: 'relative',
        height: '200px',
        marginTop: '5px',
        overflowX: 'auto',
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
            keyboardKey={keyMap[i] || ''}
          />
        </div>
      ))}
    </div>
  );
};

export default Piano;
