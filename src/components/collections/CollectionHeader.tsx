'use client';

import React from 'react';
import { TopCollections } from '@/types/topCollections';
import styles from './CollectionHeader.module.css';

interface CollectionHeaderProps {
  collection: TopCollections;
  onClose: () => void;
  onPlayAll?: () => void;
  onShuffle?: () => void;
  isPlaying?: boolean;
}

const CollectionHeader: React.FC<CollectionHeaderProps> = ({ 
  collection, 
  onClose, 
  onPlayAll,
  onShuffle,
  isPlaying = false
}) => {
  const getGradientStyle = (color: string) => {
    return {
      background: `linear-gradient(135deg, ${color}40, ${color}20, ${color}10)`,
    };
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
            <span className={styles.songCount}>
              {collection.nftsList?.length || 0} songs
            </span>
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
