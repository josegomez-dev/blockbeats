// components/CharacterPanel.tsx
import React from "react";
import styles from "@/app/assets/styles/CharacterPanel.module.css";

const CharacterPanel = () => {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>🎵 MusicBot</h2>

      <div className={styles.avatarContainer}>
        <img src="/avatar/male/phase-1.png" alt="Character" className={styles.avatar} />
        <p className={styles.status}>Level: <span data-text="2" className="glitch">2</span> | XP: <span data-text="67%" className="glitch">67%</span></p>
      </div>

      <div className={styles.stats}>
        <p>🎯 Quest: Complete 3 melodies</p>
        <p>⚡ Energy: 83%</p>
        <p>🧠 Creativity Boost: +12</p>
      </div>

      <button onClick={() => alert('asd')} className={styles.evolveBtn}>Evolve Character</button>
    </div>
  );
};

export default CharacterPanel;
