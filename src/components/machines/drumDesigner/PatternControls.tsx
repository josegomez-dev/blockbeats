'use client';

import React from 'react';
import { FaPlus } from 'react-icons/fa';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';

interface PatternControlsProps {
  gridLength: number;
  maxInstruments: number;
  isSoundSidebarOpen: boolean;
  isGenerating: boolean;
  onAddRow: () => void;
  onToggleSoundSidebar: () => void;
  onGenerateAutoPattern: () => void;
}

const PatternControls: React.FC<PatternControlsProps> = ({
  gridLength,
  maxInstruments,
  isSoundSidebarOpen,
  isGenerating,
  onAddRow,
  onToggleSoundSidebar,
  onGenerateAutoPattern,
}) => {
  return (
    <div className={styles.patternControlsBar}>
      <div className={styles.patternButtons}>
        <div className={styles.controlGroup}>
          <button 
            className={styles.addRowBtn}
            onClick={onAddRow}
            disabled={gridLength >= maxInstruments}
            title={gridLength >= maxInstruments ? "Maximum instruments reached" : "Add Instrument Row"}
          >
            <FaPlus />
            <span>Add Row</span>
          </button>
        </div>

        <div className={styles.controlGroup}>
          <button 
            className={styles.soundGalleryBtn}
            onClick={onToggleSoundSidebar}
            title="Open Sound Library"
          >
            🎧 Sound Gallery {isSoundSidebarOpen ? '▼' : '▶'}
          </button>
        </div>

        <div className={styles.controlGroup}>
          <button 
            className={`${styles.autoPatternBtn} ${isGenerating ? styles.generating : ''}`}
            onClick={onGenerateAutoPattern}
            disabled={isGenerating}
            title="Generate random drum patterns with different time signatures, tempos, and sounds!"
          >
            {isGenerating ? '🎵 Generating...' : '🎲 Random Beat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternControls;
