'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/app/assets/styles/MainPage.module.css';
import { frequencyRanges } from '@/utils/constants/musicDrawingMachine';

interface FrequencyModalProps {
  selected: string;
  onSelect: (name: string) => void;
  onSubmit: () => void;
}

const FrequencyModal: React.FC<FrequencyModalProps> = ({ selected, onSelect, onSubmit }) => {
  const [sliderIndex, setSliderIndex] = useState(
    frequencyRanges.findIndex((r) => r.name === selected)
  );

  useEffect(() => {
    if (sliderIndex >= 0 && sliderIndex < frequencyRanges.length) {
      onSelect(frequencyRanges[sliderIndex].name);
    }
  }, [sliderIndex, onSelect]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{
          backdropFilter: 'blur(50px)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          padding: 20,
          borderRadius: 10,
          textAlign: 'center',
          width: 'fit-content',
        }}
      >
        <Image
          src="/frequency-types.webp"
          alt="frequency types"
          width={350}
          height={350}
          style={{ maxWidth: '90%', height: 'auto' }}
        />
        <br />
        <br />
        <input
          type="range"
          min={0}
          max={frequencyRanges.length - 1}
          value={sliderIndex}
          onChange={(e) => setSliderIndex(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div
          style={{
            fontSize: 18,
            color: frequencyRanges[sliderIndex]?.color || 'white',
          }}
        >
          {frequencyRanges[sliderIndex]?.name}
        </div>
        <br />
        <button
          type="submit"
          className={styles.submitBtn}
          style={{
            animation: 'none',
            background: 'transparent',
            color: 'white',
          }}
        >
          Choose Freq.
        </button>
      </form>
    </div>
  );
};

export default FrequencyModal;
