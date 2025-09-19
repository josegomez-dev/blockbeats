'use client';

import React, { useState } from 'react';
import { FaDice, FaMusic, FaTimes, FaPalette } from 'react-icons/fa';
import { ScaleName, SCALE_NAMES, scaleDescriptions } from '@/utils/constants/musicDrawingMachine';
import styles from './RandomMelodyModal.module.css';

interface RandomMelodyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerate: (options: {
    scale: ScaleName;
    mode: 'single' | 'chords' | 'both';
    density: number;
    tempo?: number;
    steps?: number;
    useRandomColors?: boolean;
  }) => void;
}

const RandomMelodyModal: React.FC<RandomMelodyModalProps> = ({
  isVisible,
  onClose,
  onGenerate
}) => {
  const [selectedScale, setSelectedScale] = useState<ScaleName>('ionian');
  const [selectedMode, setSelectedMode] = useState<'single' | 'chords' | 'both'>('both');
  const [density, setDensity] = useState(0.6);
  const [customTempo, setCustomTempo] = useState<number | null>(null);
  const [customSteps, setCustomSteps] = useState<number | null>(null);
  const [useRandomColors, setUseRandomColors] = useState(false);

  const handleGenerate = () => {
    onGenerate({
      scale: selectedScale,
      mode: selectedMode,
      density,
      tempo: customTempo || undefined, // Will be randomized if not provided
      steps: customSteps || undefined,  // Will be randomized if not provided
      useRandomColors
    });
    onClose();
  };


  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaDice className={styles.titleIcon} />
            Random Melody Generator
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>

          {/* Density Control */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Density</h3>
            <div className={styles.densityControl}>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className={styles.densitySlider}
              />
              <span className={styles.densityValue}>{Math.round(density * 100)}%</span>
            </div>
            <p className={styles.densityDescription}>
              Higher density = more notes per step
            </p>
          </div>

          {/* Color Options */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaPalette className={styles.sectionIcon} />
              Color Style
            </h3>
            <div className={styles.colorOptions}>
              <button
                className={`${styles.colorOption} ${!useRandomColors ? styles.selected : ''}`}
                onClick={() => setUseRandomColors(false)}
              >
                <span className={styles.colorOptionIcon}>⚪</span>
                <div className={styles.colorOptionContent}>
                  <span className={styles.colorOptionTitle}>White (Default)</span>
                  <span className={styles.colorOptionDesc}>Clean, minimalist look</span>
                </div>
              </button>
              <button
                className={`${styles.colorOption} ${useRandomColors ? styles.selected : ''}`}
                onClick={() => setUseRandomColors(true)}
              >
                <span className={styles.colorOptionIcon}>🌈</span>
                <div className={styles.colorOptionContent}>
                  <span className={styles.colorOptionTitle}>Random Colors</span>
                  <span className={styles.colorOptionDesc}>Vibrant, colorful melody</span>
                </div>
              </button>
            </div>
            <p className={styles.colorDescription}>
              {useRandomColors 
                ? "🎨 Each note will have a random color for a vibrant musical art piece"
                : "⚪ All notes will use white color for a clean, minimalist appearance"
              }
            </p>
          </div>

          {/* Optional Tempo & Steps */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tempo & Steps</h3>
            <div className={styles.randomInfo}>
              <p className={styles.randomDescription}>
                🎲 <strong>Random Mode:</strong> Tempo (40-400 BPM) and Steps (8-32) will be randomly generated for maximum variety!
              </p>
            </div>
            <div className={styles.optionalControls}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Custom Tempo (Optional)</label>
                <input
                  type="number"
                  min="40"
                  max="400"
                  value={customTempo || ''}
                  onChange={(e) => setCustomTempo(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Random (40-400)"
                  className={styles.controlInput}
                />
                <small className={styles.controlHint}>Leave empty for random tempo</small>
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Custom Steps (Optional)</label>
                <input
                  type="number"
                  min="8"
                  max="32"
                  value={customSteps || ''}
                  onChange={(e) => setCustomSteps(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Random (8-32)"
                  className={styles.controlInput}
                />
                <small className={styles.controlHint}>Leave empty for random steps</small>
              </div>
            </div>
          </div>

          {/* Scale Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaMusic className={styles.sectionIcon} />
              Scale & Mode
            </h3>
            <div className={styles.scaleGrid}>
              {SCALE_NAMES.slice(0, 8).map((scale) => (
                <button
                  key={scale}
                  className={`${styles.scaleButton} ${selectedScale === scale ? styles.selected : ''}`}
                  onClick={() => setSelectedScale(scale)}
                  title={scaleDescriptions[scale]}
                >
                  <span className={styles.scaleName}>{scale}</span>
                  <span className={styles.scaleDesc}>{scaleDescriptions[scale]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Melody Type</h3>
            <div className={styles.modeButtons}>
              <button
                className={`${styles.modeButton} ${selectedMode === 'single' ? styles.selected : ''}`}
                onClick={() => setSelectedMode('single')}
              >
                🎵 Single Notes
              </button>
              <button
                className={`${styles.modeButton} ${selectedMode === 'chords' ? styles.selected : ''}`}
                onClick={() => setSelectedMode('chords')}
              >
                🎹 Chords
              </button>
              <button
                className={`${styles.modeButton} ${selectedMode === 'both' ? styles.selected : ''}`}
                onClick={() => setSelectedMode('both')}
              >
                🎼 Both
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.generateButton} onClick={handleGenerate}>
            <FaDice />
            Generate Melody
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomMelodyModal;
