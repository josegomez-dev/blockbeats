'use client';

import React from 'react';
import { TopCollections } from '@/types/topCollections';
import styles from './CollectionCard.module.css';

interface CollectionCardProps {
  collection: TopCollections;
  onClick: (collectionId: string) => void;
  isSelected?: boolean;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ 
  collection, 
  onClick, 
  isSelected = false 
}) => {
  const getGradientStyle = (color: string) => {
    // Use collectionColor if available, otherwise fall back to color, then default
    const primaryColor = collection.collectionColor || collection.color || color;
    
    return {
      background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}25, ${primaryColor}15)`,
      borderColor: `${primaryColor}60`,
      '--primary-color': primaryColor,
    } as React.CSSProperties;
  };

  return (
    <div 
      className={`${styles.collectionCard} ${isSelected ? styles.selected : ''}`}
      style={getGradientStyle(collection.color || '#00ffc3')}
      onClick={() => onClick(collection.id)}
    >
      <div className={styles.cardContent}>
        <div className={styles.collectionIcon}>
          <div className={styles.iconWrapper}>
            🎵
          </div>
        </div>
        
        <div className={styles.collectionInfo}>
          <h3 className={styles.collectionName}>
            {collection.collectionName}
          </h3>
          <p className={styles.collectionDescription}>
            {collection.collectionDescription}
          </p>
          <div className={styles.collectionStats}>
            <span className={styles.songCount}>
              {collection.nftsList?.length || 0} songs
            </span>
            <span className={styles.separator}>•</span>
            <span className={styles.createdBy}>
              by {collection.createdBy?.slice(0, 6)}...{collection.createdBy?.slice(-4)}
            </span>
          </div>
        </div>
        
        <div className={styles.playButton}>
          <div className={styles.playIcon}>
            ▶️
          </div>
        </div>
      </div>
      
      <div className={styles.cardOverlay}>
        <div className={styles.overlayContent}>
          <div className={styles.playButtonLarge}>
            ▶️
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
