'use client';

import React, { useState } from 'react';
import { FaPlay, FaPause, FaStop, FaUndo, FaDrum, FaMusic, FaDice, FaVolumeMute, FaPalette, FaRocket, FaVolumeUp, FaPlug, FaUnlink } from 'react-icons/fa';
import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

// Function to get dynamic styling based on frequency range
const getFrequencyButtonStyle = (selectedRange: string) => {
  const colorMap: { [key: string]: { background: string; boxShadow: string } } = {
    'Mono': {
      background: 'linear-gradient(135deg, #808080, #696969)',
      boxShadow: '0 2px 8px rgba(128, 128, 128, 0.3)'
    },
    'Harmonic': {
      background: 'linear-gradient(135deg, #32cd32, #228b22)',
      boxShadow: '0 2px 8px rgba(50, 205, 50, 0.3)'
    },
    'Ornamental': {
      background: 'linear-gradient(135deg, #1e90ff, #0066cc)',
      boxShadow: '0 2px 8px rgba(30, 144, 255, 0.3)'
    },
    'Fractal': {
      background: 'linear-gradient(135deg, #ffd700, #ffb347)',
      boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
    },
    'Celestial': {
      background: 'linear-gradient(135deg, #ee82ee, #ba55d3)',
      boxShadow: '0 2px 8px rgba(238, 130, 238, 0.3)'
    }
  };

  return colorMap[selectedRange] || colorMap['Ornamental'];
};

interface MusicDrawingMachinePlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  tempo: number;
  steps: number;
  isDrumEnabled: boolean;
  selectedRange: string;
  volume: number;
  isMidiConnected: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onTempoChange: (tempo: number) => void;
  onStepsChange: (steps: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleDrums: (enabled: boolean) => void;
  onOpenFreqModal: () => void;
  onOpenRandomMelodyModal: () => void;
  onAddSilence?: () => void;
  isSilenceMode?: boolean;
  onOpenColorSidebar?: () => void;
  onOpenQuickGenerate?: () => void;
}

const MusicDrawingMachinePlaybackControls: React.FC<MusicDrawingMachinePlaybackControlsProps> = ({
  isPlaying,
  isPaused,
  tempo,
  steps,
  isDrumEnabled,
  selectedRange,
  volume,
  isMidiConnected,
  onPlay,
  onPause,
  onResume,
  onStop,
  onReset,
  onTempoChange,
  onStepsChange,
  onVolumeChange,
  onToggleDrums,
  onOpenFreqModal,
  onOpenRandomMelodyModal,
  onAddSilence,
  isSilenceMode = false,
  onOpenColorSidebar,
  onOpenQuickGenerate,
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
          <button 
            className={`${styles.transportBtn} ${styles.drumToggle} ${isDrumEnabled ? styles.enabled : styles.disabled}`}
            onClick={() => onToggleDrums(!isDrumEnabled)}
            disabled={isPlaying && !isPaused}
            title={(isPlaying && !isPaused) ? "Cannot toggle drums while playing" : (isDrumEnabled ? "Disable Drums" : "Enable Drums")}
          >
            <FaDrum />
            <span>{isDrumEnabled ? 'ON' : 'OFF'}</span>
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

          <div className={styles.controlGroup}>
            <div className={styles.midiStatus}>
              <div className={`${styles.midiIndicator} ${isMidiConnected ? styles.connected : styles.disconnected}`}>
                {isMidiConnected ? <FaPlug /> : <FaUnlink />}
              </div>
              <span className={styles.midiLabel}>
                {isMidiConnected ? 'MIDI Connected' : 'No MIDI'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Control Bar: Drums and Frequency Controls */}
      <div className={styles.patternControlsBar}>
        <div className={styles.patternButtons}>
          <div className={styles.controlGroup}>
            <button 
              className={styles.freqBtn}
              onClick={onOpenFreqModal}
              title="Frequency Range"
              style={{
                background: getFrequencyButtonStyle(selectedRange).background,
                boxShadow: getFrequencyButtonStyle(selectedRange).boxShadow
              }}
            >
              <FaMusic />
              <span>Change Frequency</span>
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

          <div className={styles.controlGroup}>
            <button 
              className={styles.randomMelodyBtn}
              onClick={onOpenQuickGenerate}
              title="Quick Generate by Genre"
            >
              <FaRocket />
              <span>Quick Generate</span>
            </button>
          </div>

          <div className={styles.controlGroup}>
            <button 
              className={`${styles.silenceBtn} ${isSilenceMode ? styles.active : ''}`}
              onClick={onAddSilence}
              title="Add Silence (Shift key)"
            >
              <FaVolumeMute />
              <span>Silence</span>
            </button>
          </div>

          <div className={styles.controlGroup}>
            <button 
              className={styles.colorPickerBtn}
              onClick={onOpenColorSidebar}
              title="Color Palette"
            >
              <FaPalette />
              <span>Colors</span>
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default MusicDrawingMachinePlaybackControls;
