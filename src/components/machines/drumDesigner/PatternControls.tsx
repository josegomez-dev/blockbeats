'use client';

import React from 'react';
import { FaPlus, FaLock, FaCoins, FaUpload } from 'react-icons/fa';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';

interface PatternControlsProps {
  gridLength: number;
  maxInstruments: number;
  maxFreeRows: number;
  isSoundSidebarOpen: boolean;
  isGenerating: boolean;
  onAddRow: () => void;
  onToggleSoundSidebar: () => void;
  onGenerateAutoPattern: () => void;
  onOpenPremiumModal: (action: 'single' | 'triple') => void;
  onOpenCustomSoundModal: () => void;
  isUserLoggedIn?: boolean;
  userCoins?: number;
}

const PatternControls: React.FC<PatternControlsProps> = ({
  gridLength,
  maxInstruments,
  maxFreeRows,
  isSoundSidebarOpen,
  isGenerating,
  onAddRow,
  onToggleSoundSidebar,
  onGenerateAutoPattern,
  onOpenPremiumModal,
  onOpenCustomSoundModal,
  isUserLoggedIn = false,
  userCoins = 0,
}) => {
  return (
    <div className={styles.patternControlsBar}>
      <div className={styles.patternButtons}>
        <div className={styles.controlGroup}>
          {gridLength < maxFreeRows ? (
            <button 
              className={styles.addRowBtn}
              onClick={onAddRow}
              disabled={gridLength >= maxInstruments}
              title={gridLength >= maxInstruments ? "Maximum instruments reached" : "Add Instrument Row"}
            >
              <FaPlus />
              <span>Add Row</span>
            </button>
          ) : (
            <button 
              className={styles.premiumUnlockBtn}
              onClick={() => onOpenPremiumModal('single')}
              disabled={gridLength >= maxInstruments}
              title={gridLength >= maxInstruments ? "Maximum instruments reached" : "Unlock Premium Rows"}
            >
              <FaLock />
              <span>Premium Rows</span>
              <FaCoins className={styles.coinIcon} />
            </button>
          )}
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
            className={styles.customSoundBtn}
            onClick={onOpenCustomSoundModal}
            title="Upload Custom Sounds"
          >
            <FaUpload />
            <span>Upload Sounds</span>
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

        {/* Premium Unlock Buttons - Always Visible */}
        <div className={styles.controlGroup}>
          <button 
            className={`${styles.premiumSingleBtn} ${!isUserLoggedIn || userCoins < 500 ? styles.disabled : ''}`}
            onClick={() => onOpenPremiumModal('single')}
            disabled={gridLength >= maxInstruments || !isUserLoggedIn || userCoins < 500}
            title={
              !isUserLoggedIn 
                ? "Please log in to unlock premium features" 
                : userCoins < 500 
                  ? "Insufficient BBC coins! Need 500 coins"
                  : gridLength >= maxInstruments 
                    ? "Maximum instruments reached" 
                    : "Unlock 1 Premium Row (500 BBC)"
            }
          >
            <FaLock />
            <span>+1 Row</span>
            <FaCoins className={styles.coinIcon} />
            <span className={styles.priceTag}>500</span>
          </button>
        </div>

        <div className={styles.controlGroup}>
          <button 
            className={`${styles.premiumTripleBtn} ${!isUserLoggedIn || userCoins < 800 ? styles.disabled : ''}`}
            onClick={() => onOpenPremiumModal('triple')}
            disabled={gridLength >= maxInstruments || !isUserLoggedIn || userCoins < 800}
            title={
              !isUserLoggedIn 
                ? "Please log in to unlock premium features" 
                : userCoins < 800 
                  ? "Insufficient BBC coins! Need 800 coins"
                  : gridLength >= maxInstruments 
                    ? "Maximum instruments reached" 
                    : "Unlock 3 Premium Rows (800 BBC)"
            }
          >
            <FaLock />
            <span>+3 Rows</span>
            <FaCoins className={styles.coinIcon} />
            <span className={styles.priceTag}>800</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatternControls;
