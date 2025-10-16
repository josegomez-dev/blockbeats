'use client';

import React from 'react';
import { NFT } from '@/types/nftTypes';
import PixelPreview from '../machines/PixelPreview';
import AuthorCard from './AuthorCard';
import styles from './NFTCard.module.css';

interface NFTCardProps {
  nft: NFT;
  isPlaying?: boolean;
  onPlay?: (nft: NFT) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, isPlaying, onPlay }) => {
  const getMachineTypeInfo = (machineType?: string) => {
    const types = {
      drawing: { name: 'Music Drawing', icon: '🎨', color: '#ff6b6b' },
      drums: { name: 'Drum Pattern', icon: '🥁', color: '#4ecdc4' },
      voicemusic: { name: 'Voice Music', icon: '🎤', color: '#45b7d1' },
      launchpad: { name: 'Launchpad', icon: '🎛️', color: '#f9ca24' }
    };
    return types[machineType as keyof typeof types] || { name: 'Unknown', icon: '🎵', color: '#000' };
  };

  const machineInfo = getMachineTypeInfo(nft.machineType);

  return (
    <div className={styles.nftCard}>
      {/* Machine Type Badge */}
      <div 
        className={styles.machineBadge}
        style={{ backgroundColor: machineInfo.color }}
      >
        <span className={styles.machineIcon}>{machineInfo.icon}</span>
        <span className={styles.machineName}>{machineInfo.name}</span>
      </div>

      {/* Format Badge for Old NFTs */}
      {nft.isOldFormat && (
        <div className={styles.formatBadge}>
          <span className={styles.formatIcon}>🏛️</span>
          <span className={styles.formatLabel}>Classic</span>
        </div>
      )}

      {/* NFT Preview */}
      <div className={styles.nftPreview}>
        {nft.machineType === 'drawing' || (nft.isOldFormat && nft.colorMap) ? (
          <PixelPreview
            colorMap={nft.colorMap || []}
            size={120}
            backgroundColor={nft.color || '#000'}
          />
        ) : nft.machineType === 'drums' && nft.drumMachine ? (
          <div className={styles.drumPreview}>
            {/* Simple drum pattern visualization */}
            <div className={styles.drumGrid}>
              {Array.from({ length: 8 }, (_, row) => (
                <div key={row} className={styles.drumRow}>
                  {Array.from({ length: 8 }, (_, col) => (
                    <div 
                      key={col} 
                      className={`${styles.drumBeat} ${
                        nft.drumMachine?.grid?.[row]?.[col] ? styles.active : ''
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.drumLabel}>🥁 Drum Pattern</div>
          </div>
        ) : (
          <div className={styles.unknownPreview}>
            <div className={styles.unknownIcon}>🎵</div>
            <div className={styles.unknownLabel}>
              {nft.isOldFormat ? 'Classic NFT' : 'Audio NFT'}
            </div>
          </div>
        )}
      </div>

      {/* NFT Info */}
      <div className={styles.nftInfo}>
        <h4 className={styles.nftTitle}>
          {nft.songName || 'Untitled'}
        </h4>
        
        {nft.description && (
          <p className={styles.nftDescription}>
            {nft.description}
          </p>
        )}

        {/* Collaborative Authors */}
        {nft.isCollaborative && nft.authors && nft.authors.length > 0 && (
          <div className={styles.collaborativeSection}>
            <div className={styles.collaborativeLabel}>
              🎵 Collaborative Song
            </div>
            <div className={styles.authorsList}>
              {nft.authors.slice(0, 3).map((author, index) => (
                <AuthorCard
                  key={author.uid}
                  author={author}
                  size="small"
                  showRobotName={false}
                />
              ))}
              {nft.authors.length > 3 && (
                <div className={styles.moreAuthors}>
                  +{nft.authors.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Single Author */}
        {!nft.isCollaborative && nft.createdBy && (
          <div className={styles.singleAuthor}>
            <div className={styles.authorLabel}>
              Created by: {nft.createdBy.slice(0, 6)}...{nft.createdBy.slice(-4)}
            </div>
          </div>
        )}

        {/* Tags */}
        {nft.tags && nft.tags.length > 0 && (
          <div className={styles.tagsList}>
            {nft.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                #{tag}
              </span>
            ))}
            {nft.tags.length > 3 && (
              <span className={styles.moreTags}>
                +{nft.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Play Button */}
        <button
          className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(nft);
          }}
        >
          {isPlaying ? '⏸️ Playing...' : '▶️ Play NFT'}
        </button>
      </div>
    </div>
  );
};

export default NFTCard;
