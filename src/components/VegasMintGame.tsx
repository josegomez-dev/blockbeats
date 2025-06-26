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

type Pixel = {
  noteIndex: number;
  time: number;
  color: string;
};

const MAX_SPINS = 3;

const VegasMintGame: React.FC<VegasMintGameProps> = ({ onClose, nfts }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<NFTData[]>([nfts[0], nfts[1], nfts[2]]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [spinCount, setSpinCount] = useState(0);

  const playSound = () => {
    const audio = new Audio('/sounds/spin.mp3');
    audio.play();
  };

  const spin = () => {
    if (spinCount >= MAX_SPINS || spinning) return;

    setSpinning(true);
    setIsAnimating(true);
    playSound();

    setTimeout(() => {
      const newResult = Array(3)
        .fill(null)
        .map(() => nfts[Math.floor(Math.random() * nfts.length)]);
      setResult(newResult);
      setSpinning(false);
      setIsAnimating(false);
      setSpinCount(prev => prev + 1);
    }, 1500);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.machine}>
        <h1 className={styles.title}>🎰 Mint Machine</h1>
        <p className={styles.description}>
          Spin the lever to mint a random NFT or earn a chance to win a special NFT!<br />
          <br />
          You can spin <span className='glitch'>{MAX_SPINS - spinCount}</span> more time{spinCount < MAX_SPINS - 1 ? 's' : ''} today.
        </p>
        <br />
        <div className={styles.slots}>
          {result.map((nft, i) => (
            <div
              key={i}
              className={`${styles.slot} ${spinning ? styles.spinning : ''} ${isAnimating ? styles.animating : ''}`}
            >
              <PixelPreview
                colorMap={(
                  Array.isArray(nft.colorMap)
                    ? nft.colorMap
                    : typeof nft.colorMap === 'string'
                      ? JSON.parse(nft.colorMap)
                      : []
                ).map((pixel: Pixel) => ({
                  noteIndex: pixel.noteIndex,
                  time: pixel.time,
                  color: pixel.color,
                }))}
                notesCount={12}
                size={50}
                style={{ marginTop: '0.5rem' }}
                backgroundColor={nft.color || '#000000'}
              />
              <p className={styles.nftTitle}>{nft.songName}</p>
              <span className={styles.nftAuthor}>by {nft.createdBy ? nft.createdBy.slice(0, 6) : 'Unknown'}...</span>
            </div>
          ))}
        </div>

        <div className={styles.leverWrapper}>
          {spinCount < MAX_SPINS ? (
            <button className={stylesMain.submitBtn} onClick={spin} disabled={spinning}>
              {spinning ? '🎲 Spinning...' : '🎯 Pull the Lever'}
            </button>
          ) : (
            <>
              <p style={{ color: 'var(--neon-color)', textAlign: 'center', marginTop: '1rem' }}>
                🌙 Try your luck again tomorrow!
              </p>  
              <button className={stylesMain.submitBtn} onClick={onClose} style={{ animation: 'none', background: 'transparent', color: 'white' }}>
               🪙 Claim <span className='glitch'>100BBC</span> Rewards
              </button>
            </>
          )}
        </div>

        <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
      </div>
    </div>
  );
};

export default VegasMintGame;
