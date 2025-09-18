'use client';

import React from 'react';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';
import { DRUM_SOUNDS } from '../../../utils/constants/drumMachine';

interface SoundSidebarProps {
  isOpen: boolean;
  soundFilter: string;
  selectedRowForSound: number | null;
  previewedSound: string | null;
  onClose: () => void;
  onFilterChange: (filter: string) => void;
  onSoundPreview: (soundName: string) => void;
  onSetSound: (soundName: string) => void;
  getRecommendedFilterForRow: (rowIndex: number) => string;
}

const SoundSidebar: React.FC<SoundSidebarProps> = ({
  isOpen,
  soundFilter,
  selectedRowForSound,
  previewedSound,
  onClose,
  onFilterChange,
  onSoundPreview,
  onSetSound,
  getRecommendedFilterForRow
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div className={styles.sidebarBackdrop} onClick={onClose} />

      {/* Collapsible Sound Sidebar */}
      <div className={`${styles.soundSidebar} ${styles.sidebarOpen}`}>
        <div className={styles.sidebarHeader}>
          <h3>🎧 Sound Library</h3>
          <button className={styles.closeSidebar} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.sidebarFilters}>
          {['all', 'kick', 'snare', 'hihat', 'sfx'].map((type) => {
            const isRecommended = selectedRowForSound !== null && 
              getRecommendedFilterForRow(selectedRowForSound) === type;
            const isActive = soundFilter === type;
            
            return (
              <button
                key={type}
                className={`${styles.filterBtn} ${isActive ? styles.activeFilter : ''} ${isRecommended ? styles.recommendedFilter : ''}`}
                onClick={() => onFilterChange(type)}
                title={isRecommended ? `Recommended for Row ${selectedRowForSound! + 1}` : ''}
              >
                {type.toUpperCase()}
                {isRecommended && <span className={styles.recommendedBadge}>★</span>}
              </button>
            );
          })}
        </div>
        
        <div className={styles.sidebarSoundList}>
          {selectedRowForSound !== null && (
            <div className={styles.selectionMode}>
              <p>Select sound for Row {selectedRowForSound + 1}</p>
              <p className={styles.instructionText}>
                Recommended: {getRecommendedFilterForRow(selectedRowForSound).toUpperCase()} sounds
              </p>
              <p className={styles.instructionText}>Click any sound to preview, then use buttons below</p>
              {previewedSound && (
                <div className={styles.previewedSound}>
                  <span>Previewing: {DRUM_SOUNDS.find(s => s.name === previewedSound)?.label}</span>
                </div>
              )}
              <div className={styles.actionButtons}>
                <button 
                  className={styles.setSoundBtn}
                  onClick={() => previewedSound && onSetSound(previewedSound)}
                  disabled={!previewedSound}
                >
                  ✓ Set Sound
                </button>
                <button 
                  className={styles.cancelSelection}
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {DRUM_SOUNDS.filter(
            (s) => !soundFilter || soundFilter === 'all' || (s.type && s.type === soundFilter)
          ).map((sound) => (
            <div
              key={sound.name}
              className={`${styles.sidebarSoundItem} ${previewedSound === sound.name ? styles.previewedSoundItem : ''}`}
              onClick={() => onSoundPreview(sound.name)}
            >
              <span className={styles.soundIcon}>{sound.icon}</span>
              <div className={styles.soundInfo}>
                <span className={styles.soundLabel}>{sound.label}</span>
                <span className={styles.soundType}>{sound.type}</span>
              </div>
              {previewedSound === sound.name && (
                <span className={styles.previewIndicator}>🔊</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SoundSidebar;
