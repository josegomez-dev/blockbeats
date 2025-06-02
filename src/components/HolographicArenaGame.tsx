'use client';

import React from 'react';
import styles from './../app/assets/styles/HolographicArenaGame.module.css'; // Adjust the path as needed

const HolographicArenaGame = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.arena}>
        <div className={styles.platform}></div>
        <div className={styles.globe}>
          <div className={styles.musicNote}>🎵</div>
        </div>
        <div className={styles.particles}></div>
      </div>
      <h2 className={styles.title}>🪐 Holographic Arena</h2>
      <p className={styles.subtitle}>Enter the sonic sphere and feel the beat in 3D!</p>
      <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
    </div>
  );
};

export default HolographicArenaGame;
