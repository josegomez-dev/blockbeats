'use client';

import React, { useState } from 'react';
import styles from './../app/assets/styles/SmartLightGame.module.css';

interface Pixel {
  noteIndex: number; // 0-11 (rows)
  time: number;      // 0-23 (columns)
  color: string;
}

interface NFTData {
  title: string;
  author: string;
  colorMap: Pixel[];
}

interface SmartLightGameProps {
  onClose: () => void;
  nfts: NFTData[];
}

const THEMES = ['urban', 'beach', 'mountain', 'space'];

const SmartLightGame: React.FC<SmartLightGameProps> = ({ onClose, nfts }) => {
  const [scene, setScene] = useState<'urban' | 'beach' | 'mountain' | 'space'>('urban');

  return (
    <div className={`${styles.overlay} ${styles[scene]}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>🌆 Smart Light City</h1>
        <p className={styles.subtitle}>NFTs lighting up the skyline with 12 notes × 24 beats!</p>

        <div className={styles.sceneSwitcher}>
          {THEMES.map((t) => (
            <button
              key={t}
              className={`${styles.sceneButton} ${scene === t ? styles.active : ''}`}
              onClick={() => setScene(t as any)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.city}>
        {nfts.map((nft, i) => (
          <div key={i} className={styles.building}>
            <div className={styles.buildingHeader}>
              <strong>{nft.title}</strong>
              <span>{nft.author.slice(0, 6)}...</span>
            </div>
            <div className={styles.windows}>
              {Array.from({ length: 12 }).map((_, row) => (
                Array.from({ length: 24 }).map((_, col) => {
                  const windowPixel = nft.colorMap.find(p => p.noteIndex === row && p.time === col);
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={styles.window}
                      style={{
                        backgroundColor: windowPixel ? windowPixel.color : '#111',
                        boxShadow: windowPixel ? `0 0 6px ${windowPixel.color}` : 'none',
                      }}
                    />
                  );
                })
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.exitButton} onClick={onClose}>
        ❌ Exit
      </button>
    </div>
  );
};

export default SmartLightGame;
