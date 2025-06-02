// app/components/VegasMintGame.tsx
'use client';
import React, { useState } from 'react';
import styles from './../app/assets/styles/VegasMintGame.module.css'; // Adjust the path as needed

const VegasMintGame = ({ onClose }: { onClose: () => void }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string[]>(['⭐', '⭐', '⭐']);

  const symbols = ['⭐', '💎', '🎵', '🎰', '🪙'];

  const playSound = () => {
    const audio = new Audio('/sounds/spin.mp3');
    audio.play();
  };

  const spin = () => {
    setSpinning(true);
    playSound();
    setTimeout(() => {
      const newResult = Array(3)
        .fill(null)
        .map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      setResult(newResult);
      setSpinning(false);
    }, 1500);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.machine}>
        <h1 className={styles.title}>🎰 Vegas Mint Machine</h1>
        <div className={styles.slots}>
          {result.map((r, i) => (
            <div key={i} className={`${styles.slot} ${spinning ? styles.spinning : ''}`}>
              {r}
            </div>
          ))}
        </div>
        <button className={styles.spinButton} onClick={spin} disabled={spinning}>
          {spinning ? 'Spinning...' : 'Spin & Mint'}
        </button>
        <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
      </div>
    </div>
  );
};

export default VegasMintGame;
