'use client';

import React, { useState } from 'react';
import styles from './../app/assets/styles/HolographicArenaGame.module.css';

interface Pixel {
  noteIndex: number;
  time: number;
  color: string;
}

interface NFTData {
  title: string;
  author: string;
  colorMap: Pixel[];
}

interface HolographicArenaGameProps {
  onClose: () => void;
  nft: NFTData[];
}

const HolographicArenaGame: React.FC<HolographicArenaGameProps> = ({ onClose, nft: nfts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentNFT = nfts[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % nfts.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + nfts.length) % nfts.length);

  return (
    <div className={styles.overlay}>
      <div className={styles.arena}>
        <div className={styles.platform}>
          <div className={styles.hologram}>
            {Array.from({ length: 12 }).map((_, row) =>
              Array.from({ length: 24 }).map((_, col) => {
                const pixel = currentNFT.colorMap.find(
                  (p) => p.noteIndex === row && p.time === col
                );
                return (
                  <div
                    key={`${row}-${col}`}
                    className={styles.pixel}
                    style={{
                      backgroundColor: pixel ? pixel.color : 'transparent',
                      boxShadow: pixel ? `0 0 10px ${pixel.color}` : 'none',
                      transform: `translate3d(${col * 10}px, ${row * 10}px, ${Math.sin(row + col) * 10}px)`
                    }}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className={styles.particles}></div>
      </div>

      <div className={styles.info}>
        <h2 className={styles.title}>🪐 Holographic Arena</h2>
        <p className={styles.subtitle}>"{currentNFT.title}" by {currentNFT.author}</p>

        <div className={styles.controls}>
          <button onClick={prev}>⬅️ Prev</button>
          <button onClick={next}>➡️ Next</button>
        </div>
      </div>

      <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
    </div>
  );
};

export default HolographicArenaGame;
