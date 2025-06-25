'use client';

import React from 'react';
import { playNote } from '@/utils/helpers/drumHelper';
import { KeyType } from '@/utils/constants/musicDrawingMachine';

interface KeyProps {
  note: string;
  frequency: number;
  type: KeyType;
  onPlay: () => void;
}

const Key: React.FC<KeyProps> = ({ note, frequency, type, onPlay }) => {
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
        height: type === 'kwhite' ? '150px' : '95px',
        marginLeft: type === 'kblack' ? '-12px' : '0',
        border: '1px solid black',
        display: 'inline-block',
        position: type === 'kblack' ? 'absolute' : 'relative',
        zIndex: type === 'kblack' ? 2 : 'auto',
        borderBottomLeftRadius: type === 'kblack' ? '5px' : '0',
        borderBottomRightRadius: type === 'kblack' ? '5px' : '0',
        cursor: 'pointer',
      }}
      title={note}
    />
  );
};

export default Key;
