'use client';

import React, { useEffect, useState } from 'react';
import styles from './../app/assets/styles/DronesShowGame.module.css';

type Pixel = {
  noteIndex: number;
  time: number;
  color: string;
};

interface PixelArtData {
  title: string;
  author: string;
  colorMap: Pixel[];
}

interface DronesShowGameProps {
  onClose: () => void;
  artworks: PixelArtData[];
  steps?: number;
  notesCount?: number;
}

const DronesShowGame: React.FC<DronesShowGameProps> = ({
  onClose,
  artworks,
  steps = 24,
  notesCount = 12,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drones, setDrones] = useState<Pixel[]>([]);
  const [animating, setAnimating] = useState(false);

  const { title, author, colorMap } = artworks[currentIndex];

  const startAnimation = () => {
    setDrones([]);
    setAnimating(true);
    let index = 0;
    const interval = setInterval(() => {
      setDrones((prev) => {
        if (index < colorMap.length) {
          return [...prev, colorMap[index++]];
        } else {
          clearInterval(interval);
          setAnimating(false);
          return prev;
        }
      });
    }, 100);
  };

  useEffect(() => {
    startAnimation();
  }, [currentIndex]);

  const handleReset = () => {
    startAnimation();
  };

  const nextArtwork = () => setCurrentIndex((prev) => (prev + 1) % artworks.length);
  const prevArtwork = () => setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);

  return (
    <div className={styles.overlay}>
      <div className={styles.sky}>
        <div className={styles.meta}>
          <h3 className='glitch'>{title}</h3>
          {/* <p>by {author}</p> */}
        </div>
        <div className={styles.droneGridWrapper}>
          <div
            className={styles.droneGrid}
            style={{
              gridTemplateColumns: `repeat(${steps}, 1fr)`,
              gridTemplateRows: `repeat(${notesCount}, 1fr)`,
            }}
          >
            {drones.map((drone, i) => (
              <div
                key={i}
                className={styles.dronePixel}
                style={{
                  gridColumn: drone.time + 1,
                  gridRow: drone.noteIndex + 1,
                  backgroundColor: drone.color,
                  animation: `${styles.flyIn} 0.5s ease-out`,
                  borderRadius: '50%',
                  boxShadow: `0 0 10px ${drone.color}`,
                }}
              />
            ))}
          </div>
        </div>

        <p className={styles.subtitle}>🚁 Watch drones draw pixel NFT art in the sky!</p>

        <div className={styles.controls}>
          <button onClick={prevArtwork}>⬅️ Prev</button>
          <button onClick={handleReset} disabled={animating}>🔄 Reset</button>
          <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
          <button onClick={nextArtwork}>➡️ Next</button>
        </div>
      </div>
    </div>
  );
};

export default DronesShowGame;
