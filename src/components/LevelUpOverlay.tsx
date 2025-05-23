'use client';
import React, { useEffect, useState } from 'react';
import styles from './../app/assets/styles/LevelUpOverlay.module.css';

interface LevelUpOverlayProps {
  message: string;
  onClose: () => void;
}

const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ message, onClose }) => {
  const [confettiPieces, setConfettiPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Generate 40 random confetti elements
    const pieces = Array.from({ length: 40 }, (_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const rotate = Math.random() * 360;
      const colorIndex = i % 5;

      return (
        <div
          key={i}
          className={`${styles.confetti} ${styles[`color${colorIndex}`]}`}
          style={{ left: `${left}%`, animationDelay: `${delay}s`, transform: `rotate(${rotate}deg)` }}
        />
      );
    });

    setConfettiPieces(pieces);

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div data-text={message} className={`${styles.message} glitch`}>{message}</div>
      {confettiPieces}
    </div>
  );
};

export default LevelUpOverlay;
