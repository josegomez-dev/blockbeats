'use client';

import React, { useEffect } from 'react';
import Key from './Key';
import { KeyType, notes, keyMap } from '../../../utils/constants/musicDrawingMachine';
import { playNote } from '@/utils/helpers/drumHelper';

interface PianoProps {
  onNotePlay: (noteIndex: number) => void;
  onSilenceAdd?: (timeStep: number) => void;
  isSilenceMode?: boolean;
  currentTimeStep?: number;
}

const Piano: React.FC<PianoProps> = ({ 
  onNotePlay, 
  onSilenceAdd, 
  isSilenceMode = false, 
  currentTimeStep = 0 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Shift key for silence mode
      if (e.key === 'Shift') {
        if (onSilenceAdd && currentTimeStep !== undefined) {
          onSilenceAdd(currentTimeStep);
        }
        return;
      }

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
  }, [onNotePlay, onSilenceAdd, currentTimeStep]);

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
