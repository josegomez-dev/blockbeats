'use client';

import React from 'react';
import styles from './../app/assets/styles/SmartLightGame.module.css'; // Adjust the path as needed

const SmartLightGame = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className={styles.overlay}>
      <h1 className={styles.title}>🌆 Smart Light City</h1>
      <p className={styles.subtitle}>Enjoy the rhythmic light show across the skyline!</p>

      <div className={styles.city}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${styles.building} ${styles[`b${i + 1}`]}`}>
            {[...Array(8)].map((_, w) => (
              <div key={w} className={styles.window}></div>
            ))}
          </div>
        ))}
      </div>

      <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
    </div>
  );
};

export default SmartLightGame;
