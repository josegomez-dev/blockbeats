'use client';

import React, { useState } from 'react';
import { FaPlay, FaPause, FaStop, FaUndo, FaDrum, FaMusic, FaDice } from 'react-icons/fa';
import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

interface MusicDrawingMachinePlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  tempo: number;
  steps: number;
  isDrumEnabled: boolean;
  selectedRange: string;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onTempoChange: (tempo: number) => void;
  onStepsChange: (steps: number) => void;
  onToggleDrums: (enabled: boolean) => void;
  onOpenFreqModal: () => void;
  onOpenRandomMelodyModal: () => void;
}

const MusicDrawingMachinePlaybackControls: React.FC<MusicDrawingMachinePlaybackControlsProps> = ({
  isPlaying,
  isPaused,
  tempo,
  steps,
  isDrumEnabled,
  selectedRange,
  onPlay,
  onPause,
  onResume,
  onStop,
  onReset,
  onTempoChange,
  onStepsChange,
  onToggleDrums,
  onOpenFreqModal,
  onOpenRandomMelodyModal,
}) => {
  return (
    <div className={styles.machineControls}>
      {/* First Control Bar: Transport Controls + Tempo/Steps */}
      <div className={styles.transportControlsBar}>
        <div className={styles.transportButtons}>
          <button 
            className={`${styles.transportBtn} ${isPlaying ? styles.playing : ''}`}
            onClick={isPlaying ? (isPaused ? onResume : onPause) : onPlay}
            title={isPlaying ? (isPaused ? "Resume" : "Pause") : "Play"}
          >
            {isPlaying && !isPaused ? <FaPause /> : <FaPlay />}
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

        <div className={styles.timingControls}>
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
        </div>
      </div>

      {/* Second Control Bar: Drums and Frequency Controls */}
      <div className={styles.patternControlsBar}>
        <div className={styles.patternButtons}>
          <div className={styles.controlGroup}>
            <button 
              className={`${styles.drumToggle} ${isDrumEnabled ? styles.enabled : styles.disabled}`}
              onClick={() => onToggleDrums(!isDrumEnabled)}
              disabled={isPlaying && !isPaused}
              title={(isPlaying && !isPaused) ? "Cannot toggle drums while playing" : (isDrumEnabled ? "Disable Drums" : "Enable Drums")}
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

          <div className={styles.controlGroup}>
            <button 
              className={styles.randomMelodyBtn}
              onClick={onOpenRandomMelodyModal}
              title="Generate Random Melody"
            >
              <FaDice />
              <span>Random Melody</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDrawingMachinePlaybackControls;
