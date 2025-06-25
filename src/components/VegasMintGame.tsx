'use client';
import React, { useState } from 'react';
import styles from './../app/assets/styles/VegasMintGame.module.css';
import stylesMain from './../app/assets/styles/MainPage.module.css';
import PixelPreview from './PixelPreview';
import { NFTData } from '@/types/nftTypes';

interface VegasMintGameProps {
  onClose: () => void;
  nfts: NFTData[];
}

const VegasMintGame: React.FC<VegasMintGameProps> = ({ onClose, nfts }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<NFTData[]>([nfts[0], nfts[1], nfts[2]]);
  const [isAnimating, setIsAnimating] = useState(false);

  const playSound = () => {
    const audio = new Audio('/sounds/spin.mp3');
    audio.play();
  };

  const spin = () => {
    setSpinning(true);
    playSound();
    setIsAnimating(true);
    setTimeout(() => {
      const newResult = Array(3)
        .fill(null)
        .map(() => nfts[Math.floor(Math.random() * nfts.length)]);
      setResult(newResult);
      setSpinning(false);
      setIsAnimating(false)
    }, 1500);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.machine}>
        <h1 className={styles.title}>🎰 Mint Machine</h1>

        <div className={styles.slots}>
          {result.map((nft, i) => (
            <div key={i} className={`${styles.slot} ${spinning ? styles.spinning : ''} ${isAnimating ? styles.animating : ''}`}>
              <PixelPreview
                colorMap={Object.entries(nft.colorMap).map(([noteIndex, color]) => ({
                  noteIndex: Number(noteIndex),
                  time: 0,
                  color,
                }))}
                notesCount={12}
                size={50}
                style={{ marginTop: '0.5rem' }}
              />
              <p className={styles.nftTitle}>{nft.songName}</p>
              {/* Replace 'author' with an existing property, e.g., 'creator' */}
              <span className={styles.nftAuthor}>by {nft.createdBy ? nft.createdBy.slice(0, 6) : 'Unknown'}...</span>
            </div>
          ))}
        </div>

        <div className={styles.leverWrapper}>
          <button className={stylesMain.submitBtn} onClick={spin} disabled={spinning}>
            {spinning ? '🎲 Spinning...' : '🎯 Pull the Lever'}
          </button>
        </div>

        <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
      </div>
    </div>
  );
};

export default VegasMintGame;
