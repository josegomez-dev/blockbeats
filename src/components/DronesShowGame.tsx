'use client';

import React, { useEffect, useState } from 'react';
import styles from './../app/assets/styles/DronesShowGame.module.css'; // Adjust the path as needed

const DronesShowGame = ({ onClose }: { onClose: () => void }) => {
  const [message, setMessage] = useState('');
  const fullMessage = '★ WELCOME TO BLOCKBEATS ★';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullMessage.length) {
        setMessage((prev) => prev + fullMessage[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.sky}>
        <h2 className={styles.title}>🚁 Drones Show</h2>
        <p className={styles.subtitle}>Watch drones draw messages and stars in the sky!</p>
        <div className={styles.droneDisplay}>
          <div className={styles.star}></div>
          <div className={styles.message}>{message}</div>
        </div>
        <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
      </div>
    </div>
  );
};

export default DronesShowGame;
