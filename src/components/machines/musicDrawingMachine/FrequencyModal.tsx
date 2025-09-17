'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/app/assets/styles/layouts/MainPage.module.css';
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
    <div className="modal-overlay">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="modal-form"
      >
        <Image
          src="/images/frequency-types.webp"
          alt="frequency types"
          width={350}
          height={350}
          className="modal-image-responsive"
        />
        <br />
        <br />
        <input
          type="range"
          min={0}
          max={frequencyRanges.length - 1}
          value={sliderIndex}
          onChange={(e) => setSliderIndex(Number(e.target.value))}
          className="modal-slider"
        />
        <div
          className="modal-frequency-text"
          style={{ color: frequencyRanges[sliderIndex]?.color || 'white' }}
        >
          {frequencyRanges[sliderIndex]?.name}
        </div>
        <br />
        <button
          type="submit"
          className={`${styles.submitBtn} btn-transparent-white`}
        >
          Choose Freq.
        </button>
      </form>
    </div>
  );
};

export default FrequencyModal;
