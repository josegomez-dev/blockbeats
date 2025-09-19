'use client';

import React from 'react';
import { FaPlay, FaPause, FaStop, FaUndo, FaVolumeUp } from 'react-icons/fa';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';

interface TransportControlsProps {
  isPlaying: boolean;
  tempo: number;
  steps: number;
  volume: number;
  timeSignature: { beats: number; noteValue: number };
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onTempoChange: (tempo: number) => void;
  onStepsChange: (steps: number) => void;
  onVolumeChange: (volume: number) => void;
  onTimeSignatureChange: (timeSig: { beats: number; noteValue: number }) => void;
}

const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  tempo,
  steps,
  volume,
  timeSignature,
  onPlay,
  onStop,
  onReset,
  onTempoChange,
  onStepsChange,
  onVolumeChange,
  onTimeSignatureChange,
}) => {
  return (
    <div className={styles.transportControlsBar}>
      <div className={styles.transportButtons}>
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

      <div className={styles.timingControls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Tempo</label>
          <input 
            type="number" 
            min="40" 
            max="400" 
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
          <label className={styles.controlLabel}>Volume</label>
          <div className={styles.volumeControl}>
            <FaVolumeUp className={styles.volumeIcon} />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className={styles.volumeSlider}
            />
            <span className={styles.volumeValue}>{volume}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportControls;
