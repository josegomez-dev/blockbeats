'use client';

import React from 'react';
import { FaRocket, FaTimes, FaMusic } from 'react-icons/fa';
import { ScaleName } from '@/utils/constants/musicDrawingMachine';
import styles from './QuickGenerateModal.module.css';

interface QuickGenerateModalProps {
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

// Genre presets with specific configurations
const genrePresets = [
  {
    id: 'futuristic',
    name: 'Futuristic',
    icon: '🚀',
    description: 'Sci-fi inspired electronic sounds',
    scale: 'ionian' as ScaleName,
    mode: 'both' as const,
    density: 0.8,
    tempo: 140,
    steps: 16,
    useRandomColors: true,
    color: '#00ffff'
  },
  {
    id: 'oldschool',
    name: 'Old School',
    icon: '🎷',
    description: 'Classic vintage vibes',
    scale: 'bluesMinor' as ScaleName,
    mode: 'single' as const,
    density: 0.6,
    tempo: 120,
    steps: 12,
    useRandomColors: false,
    color: '#ff6b6b'
  },
  {
    id: 'rnb',
    name: 'R&B',
    icon: '🎤',
    description: 'Smooth and soulful melodies',
    scale: 'aeolian' as ScaleName,
    mode: 'chords' as const,
    density: 0.7,
    tempo: 90,
    steps: 8,
    useRandomColors: false,
    color: '#ff8e53'
  },
  {
    id: 'techno',
    name: 'Techno',
    icon: '⚡',
    description: 'High-energy electronic beats',
    scale: 'dorian' as ScaleName,
    mode: 'both' as const,
    density: 0.9,
    tempo: 130,
    steps: 32,
    useRandomColors: true,
    color: '#9c27b0'
  },
  {
    id: 'ambient',
    name: 'Ambient',
    icon: '🌌',
    description: 'Peaceful and atmospheric',
    scale: 'majorPentatonic' as ScaleName,
    mode: 'single' as const,
    density: 0.4,
    tempo: 80,
    steps: 16,
    useRandomColors: false,
    color: '#4caf50'
  },
  {
    id: 'jazz',
    name: 'Jazz',
    icon: '🎺',
    description: 'Complex and sophisticated',
    scale: 'mixolydian' as ScaleName,
    mode: 'chords' as const,
    density: 0.8,
    tempo: 110,
    steps: 12,
    useRandomColors: false,
    color: '#ff9800'
  },
  {
    id: 'rock',
    name: 'Rock',
    icon: '🎸',
    description: 'Powerful and energetic',
    scale: 'ionian' as ScaleName,
    mode: 'both' as const,
    density: 0.7,
    tempo: 140,
    steps: 16,
    useRandomColors: false,
    color: '#f44336'
  },
  {
    id: 'chill',
    name: 'Chill',
    icon: '🌊',
    description: 'Relaxed and mellow vibes',
    scale: 'aeolian' as ScaleName,
    mode: 'single' as const,
    density: 0.5,
    tempo: 100,
    steps: 8,
    useRandomColors: false,
    color: '#2196f3'
  }
];

const QuickGenerateModal: React.FC<QuickGenerateModalProps> = ({
  isVisible,
  onClose,
  onGenerate
}) => {
  const handleGenreSelect = (preset: typeof genrePresets[0]) => {
    onGenerate({
      scale: preset.scale,
      mode: preset.mode,
      density: preset.density,
      tempo: preset.tempo,
      steps: preset.steps,
      useRandomColors: preset.useRandomColors
    });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaRocket className={styles.titleIcon} />
            Quick Generate
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.introSection}>
            <p className={styles.introText}>
              🎵 Choose a genre to instantly generate a melody with pre-configured settings!
            </p>
          </div>

          <div className={styles.genreGrid}>
            {genrePresets.map((preset) => (
              <button
                key={preset.id}
                className={styles.genreCard}
                onClick={() => handleGenreSelect(preset)}
                style={{ '--genre-color': preset.color } as React.CSSProperties}
              >
                <div className={styles.genreIcon}>{preset.icon}</div>
                <div className={styles.genreInfo}>
                  <h3 className={styles.genreName}>{preset.name}</h3>
                  <p className={styles.genreDescription}>{preset.description}</p>
                  <div className={styles.genreDetails}>
                    <span className={styles.genreDetail}>
                      <FaMusic className={styles.detailIcon} />
                      {preset.scale} • {preset.mode}
                    </span>
                    <span className={styles.genreDetail}>
                      🎵 {preset.tempo} BPM • {preset.steps} steps
                    </span>
                    <span className={styles.genreDetail}>
                      {preset.useRandomColors ? '🌈 Random Colors' : '⚪ White'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickGenerateModal;
