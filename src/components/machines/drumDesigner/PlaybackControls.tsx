'use client';

import React, { useState } from 'react';
import { FaPlay, FaPause, FaStop, FaUndo, FaPlus } from 'react-icons/fa';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';

interface DrumDesignerPlaybackControlsProps {
  isPlaying: boolean;
  tempo: number;
  steps: number;
  gridLength: number;
  maxInstruments: number;
  isSoundSidebarOpen: boolean;
  timeSignature: { beats: number; noteValue: number };
  isGenerating: boolean;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onTempoChange: (tempo: number) => void;
  onStepsChange: (steps: number) => void;
  onTimeSignatureChange: (timeSig: { beats: number; noteValue: number }) => void;
  onAddRow: () => void;
  onToggleSoundSidebar: () => void;
  onGenerateAutoPattern: () => void;
}

const DrumDesignerPlaybackControls: React.FC<DrumDesignerPlaybackControlsProps> = ({
  isPlaying,
  tempo,
  steps,
  gridLength,
  maxInstruments,
  isSoundSidebarOpen,
  timeSignature,
  isGenerating,
  onPlay,
  onStop,
  onReset,
  onTempoChange,
  onStepsChange,
  onTimeSignatureChange,
  onAddRow,
  onToggleSoundSidebar,
  onGenerateAutoPattern,
}) => {
  return (
    <div className={styles.machineControls}>
      <div className={styles.transportControls}>
        <button 
          className={`${styles.transportBtn} ${isPlaying ? styles.playing : ''}`}
          onClick={isPlaying ? onStop : onPlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button 
          className={`${styles.transportBtn} ${styles.stopBtn}`}
          onClick={onStop}
          title="Stop"
        >
          <FaStop />
        </button>
        <button 
          className={`${styles.transportBtn} ${styles.resetBtn}`}
          onClick={onReset}
          title="Reset"
        >
          <FaUndo />
        </button>
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.controlLabel}>Tempo</label>
        <input 
          type="number" 
          min="60" 
          max="200" 
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className={styles.controlInput}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.controlLabel}>Time</label>
        <select
          value={`${timeSignature.beats}/${timeSignature.noteValue}`}
          onChange={(e) => {
            const [beats, noteValue] = e.target.value.split('/').map(Number);
            onTimeSignatureChange({ beats, noteValue });
          }}
          className={styles.controlSelect}
        >
          <option value="4/4">4/4</option>
          <option value="3/4">3/4</option>
          <option value="2/4">2/4</option>
          <option value="6/8">6/8</option>
        </select>
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.controlLabel}>Steps</label>
        <input 
          type="number" 
          min="4" 
          max="32" 
          value={steps}
          onChange={(e) => onStepsChange(Number(e.target.value))}
          className={styles.controlInput}
        />
      </div>

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
  );
};

export default DrumDesignerPlaybackControls;
