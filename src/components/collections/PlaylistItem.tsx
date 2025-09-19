'use client';

import React from 'react';
import { NFT } from '@/types/nftTypes';
import PixelPreview from '../machines/PixelPreview';
import styles from './PlaylistItem.module.css';

interface PlaylistItemProps {
  nft: NFT;
  index: number;
  isPlaying?: boolean;
  onPlay: (nft: NFT) => void;
  onRemove?: (nftId: string) => void;
  showRemoveButton?: boolean;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ 
  nft, 
  index, 
  isPlaying, 
  onPlay, 
  onRemove,
  showRemoveButton = false
}) => {
  const formatDuration = (tempo?: number) => {
    if (!tempo) return '2:30';
    // Simple duration calculation based on tempo
    const duration = Math.floor(120 / (tempo / 60));
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMachineTypeIcon = (machineType?: string) => {
    const icons = {
      drawing: '🎨',
      drums: '🥁',
      voicemusic: '🎤',
      launchpad: '🎛️'
    };
    return icons[machineType as keyof typeof icons] || '🎵';
  };

  return (
    <div className={`${styles.playlistItem} ${isPlaying ? styles.playing : ''}`}>
      <div className={styles.itemIndex}>
        {isPlaying ? (
          <div className={styles.playingIcon}>🎵</div>
        ) : (
          <span className={styles.indexNumber}>{index + 1}</span>
        )}
      </div>
      
      <div className={styles.albumArt}>
        <PixelPreview
          colorMap={nft.colorMap || []}
          size={50}
          backgroundColor={nft.color || '#000'}
        />
      </div>
      
      <div className={styles.songInfo}>
        <div className={styles.songTitle}>
          {nft.songName || 'Untitled'}
        </div>
        <div className={styles.songDetails}>
          <span className={styles.machineType}>
            {getMachineTypeIcon(nft.machineType)} {nft.machineType || 'Unknown'}
          </span>
          {nft.isCollaborative && nft.authors && (
            <span className={styles.collaborative}>
              🎵 Collaborative
            </span>
          )}
        </div>
      </div>
      
      <div className={styles.songDuration}>
        {formatDuration(nft.tempo)}
      </div>
      
      <div className={styles.actions}>
        <button
          className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
          onClick={() => onPlay(nft)}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        {showRemoveButton && onRemove && (
          <button
            className={styles.removeButton}
            onClick={() => onRemove(nft.id)}
            title="Remove from collection"
          >
            ❌
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaylistItem;
