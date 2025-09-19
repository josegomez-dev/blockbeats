'use client';

import React from 'react';
import { TopCollections } from '@/types/topCollections';
import styles from './CollectionHeader.module.css';

interface CollectionHeaderProps {
  collection: TopCollections;
  onClose: () => void;
  onPlayAll?: () => void;
  onShuffle?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isPlaying?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

const CollectionHeader: React.FC<CollectionHeaderProps> = ({ 
  collection, 
  onClose, 
  onPlayAll,
  onShuffle,
  onNext,
  onPrevious,
  isPlaying = false,
  canGoNext = false,
  canGoPrevious = false
}) => {
  const getGradientStyle = (color: string) => {
    // Use collectionColor if available, otherwise fall back to color, then default
    const primaryColor = collection.collectionColor || collection.color || color;
    
    return {
      background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20, ${primaryColor}10)`,
      '--primary-color': primaryColor,
    } as React.CSSProperties;
  };

  return (
    <div 
      className={styles.collectionHeader}
      style={getGradientStyle(collection.color || '#00ffc3')}
    >
      <div className={styles.headerContent}>
        <div className={styles.collectionInfo}>
          <div className={styles.collectionIcon}>
            <div className={styles.iconWrapper}>
              🎵
            </div>
          </div>
          
          <div className={styles.collectionDetails}>
            <h1 className={styles.collectionName}>
              {collection.collectionName}
            </h1>
            <p className={styles.collectionDescription}>
              {collection.collectionDescription}
            </p>
            <div className={styles.collectionStats}>
              <span className={styles.separator}>•</span>
              <span className={styles.createdBy}>
                Created by {collection.createdBy?.slice(0, 6)}...{collection.createdBy?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.playButtons}>
            <button
              className={`${styles.playAllButton} ${isPlaying ? styles.playing : ''}`}
              onClick={onPlayAll}
            >
              {isPlaying ? '⏸️' : '▶️'} {isPlaying ? 'Pause' : 'Play All'}
            </button>
            
            {isPlaying && (
              <>
                <button
                  className={`${styles.navButton} ${!canGoPrevious ? styles.disabled : ''}`}
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  title="Previous"
                >
                  ⏮️
                </button>
                <button
                  className={`${styles.navButton} ${!canGoNext ? styles.disabled : ''}`}
                  onClick={onNext}
                  disabled={!canGoNext}
                  title="Next"
                >
                  ⏭️
                </button>
              </>
            )}
            
            <button
              className={styles.shuffleButton}
              onClick={onShuffle}
            >
              🔀 Shuffle
            </button>
          </div>
          
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionHeader;
