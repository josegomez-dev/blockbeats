'use client';

import React, { useState } from 'react';
import styles from '@/app/assets/styles/PlaybackControls.module.css';

interface PlaybackControlsProps {
  isPlaying: boolean;
  tempo: number;
  steps?: number;
  isDrumEnabled?: boolean;
  showDrumsToggle?: boolean;
  minSteps?: number;
  maxSteps?: number;
  minTempo?: number;
  maxTempo?: number;
  showReset?: boolean;
  showSave?: boolean;
  showSteps?: boolean;
  showFreq?: boolean;
  onPlay: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onSave?: () => void;
  onTempoChange: (tempo: number) => void;
  onStepChange?: (steps: number) => void;
  onOpenFrequencyModal?: () => void;
  onToggleDrums?: (enabled: boolean) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  tempo,
  steps,
  isDrumEnabled,
  showDrumsToggle = false,
  minSteps = 4,
  maxSteps = 64,
  minTempo = 60,
  maxTempo = 180,
  showReset = true,
  showSave = true,
  showSteps = true,
  showFreq = false,
  onPlay,
  onStop,
  onReset,
  onSave,
  onTempoChange,
  onStepChange,
  onOpenFrequencyModal,
  onToggleDrums,
}) => {
  const [showOptions, setShowOptions] = useState(true);

  const tempoOptions = Array.from({ length: (maxTempo - minTempo) / 10 + 1 }, (_, i) => minTempo + i * 10);
  const stepOptions = Array.from({ length: (maxSteps - minSteps) / 4 + 1 }, (_, i) => minSteps + i * 4);

  return (
    <div className={styles.controls}>
      <div className={styles.row}>
        <button className={styles.item} onClick={isPlaying ? onStop : onPlay}>
          {isPlaying ? '⏹️' : '▶️'}
        </button>

        {showReset && (
          <button className={styles.item} onClick={onReset}>🧹 Reset</button>
        )}

        {showSave && (
          <button className={styles.item} onClick={onSave}>💾</button>
        )}

        {showFreq && (
          <button className={styles.item} onClick={onOpenFrequencyModal}> 🎨 </button>
        )}

        <button className={styles.item} onClick={() => setShowOptions(!showOptions)}>
          ...&nbsp;{showOptions ? '🔽' : '🔼'}
        </button>
      </div>

      {showOptions && (
        <div className={styles.row}>
            {showSteps !== false && onStepChange && (
                <select
                    value={steps}
                    onChange={(e) => onStepChange(Number(e.target.value))}
                    className={styles.stepSelector}
                >
                    {stepOptions.map((val) => (
                    <option key={val} value={val}>
                        {val} Steps
                    </option>
                    ))}
                </select>
                )}


          <label className={styles.selectGroup}>
            <select
              value={tempo}
              onChange={(e) => onTempoChange(Number(e.target.value))}
            >
              {tempoOptions.map((val) => (
                <option key={val} value={val}>{val} BPM</option>
              ))}
            </select>
          </label>

          {showDrumsToggle && (
            <label className={styles.selectGroup}>
              🥁
              <input
                type="checkbox"
                checked={isDrumEnabled}
                onChange={(e) => onToggleDrums?.(e.target.checked)}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaybackControls;
