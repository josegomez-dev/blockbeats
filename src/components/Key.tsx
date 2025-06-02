// components/Key.tsx
'use client';

import { KeyType } from '@/utils/constants/musicDrawingMachine';
import React, { useRef } from 'react';

interface KeyProps {
  note: string;
  frequency: number;
  type: KeyType;
  onPlay: () => void;
  ctx: AudioContext | null;
}

const Key: React.FC<KeyProps> = ({ note, frequency, type, onPlay, ctx }) => {
  const oscRef = useRef<OscillatorNode | null>(null);

  const play = () => {
    if (ctx && !oscRef.current) {
      const osc = ctx.createOscillator();
      osc.frequency.value = frequency;
      osc.type = 'sawtooth';
      osc.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      onPlay();
    }
  };

  const stop = () => {
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
  };

  return (
    <div
      onMouseDown={play}
      onMouseUp={stop}
      onMouseOut={stop}
      onTouchStart={play}
      onTouchEnd={stop}
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
