'use client';

import React from 'react';
import { playNote } from '@/utils/helpers/drumHelper';
import { KeyType } from '@/utils/constants/musicDrawingMachine';

interface KeyProps {
  note: string;
  frequency: number;
  type: KeyType;
  onPlay: () => void;
  keyboardKey?: string;
}

const Key: React.FC<KeyProps> = ({ note, frequency, type, onPlay, keyboardKey }) => {
  const handlePlay = () => {
    playNote(frequency);
    onPlay();
  };

  return (
    <div
      onMouseDown={handlePlay}
      onTouchStart={handlePlay}
      style={{
        background: type === 'kblack' ? 'black' : 'white',
        width: type === 'kwhite' ? '40px' : '23px',
        height: type === 'kwhite' ? '130px' : '95px',
        marginLeft: type === 'kblack' ? '-12px' : '0',
        border: '1px solid black',
        display: 'inline-block',
        marginTop: type === 'kblack' ? '-145px' : '0px',
        position: type === 'kblack' ? 'absolute' : 'relative',
        zIndex: type === 'kblack' ? 2 : 'auto',
        borderBottomLeftRadius: type === 'kblack' ? '5px' : '0',
        borderBottomRightRadius: type === 'kblack' ? '5px' : '0',
        cursor: 'pointer',
      }}
      title={note}
    >
      {keyboardKey && (
        <div
          style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            fontSize: '12px',
            color: type === 'kblack' ? 'white' : 'black',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        >
          {keyboardKey}
        </div>
      )}
    </div>

  );
};

export default Key;
