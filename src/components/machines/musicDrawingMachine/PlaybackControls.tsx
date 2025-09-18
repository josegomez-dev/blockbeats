'use client';

import React, { useState } from 'react';
import { FaPlay, FaPause, FaStop, FaUndo, FaDrum, FaMusic } from 'react-icons/fa';
import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

interface MusicDrawingMachinePlaybackControlsProps {
  isPlaying: boolean;
  tempo: number;
  steps: number;
  isDrumEnabled: boolean;
  selectedRange: string;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onTempoChange: (tempo: number) => void;
  onStepsChange: (steps: number) => void;
  onToggleDrums: (enabled: boolean) => void;
  onOpenFreqModal: () => void;
}

const MusicDrawingMachinePlaybackControls: React.FC<MusicDrawingMachinePlaybackControlsProps> = ({
  isPlaying,
  tempo,
  steps,
  isDrumEnabled,
  selectedRange,
  onPlay,
  onStop,
  onReset,
  onTempoChange,
  onStepsChange,
  onToggleDrums,
  onOpenFreqModal,
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
        <label className={styles.controlLabel}>Steps</label>
        <input 
          type="number" 
          min="4" 
          max="100" 
          value={steps}
          onChange={(e) => onStepsChange(Number(e.target.value))}
          className={styles.controlInput}
        />
      </div>

      <div className={styles.controlGroup}>
        <button 
          className={`${styles.drumToggle} ${isDrumEnabled ? styles.enabled : styles.disabled}`}
          onClick={() => onToggleDrums(!isDrumEnabled)}
          disabled={isPlaying}
          title={isPlaying ? "Cannot toggle drums while playing" : (isDrumEnabled ? "Disable Drums" : "Enable Drums")}
        >
          <FaDrum />
          <span>{isDrumEnabled ? 'Drums ON' : 'Drums OFF'}</span>
        </button>
      </div>

      <div className={styles.controlGroup}>
        <button 
          className={styles.freqBtn}
          onClick={onOpenFreqModal}
          title="Frequency Range"
        >
          <FaMusic />
          <span>{selectedRange}</span>
        </button>
      </div>
    </div>
  );
};

export default MusicDrawingMachinePlaybackControls;
