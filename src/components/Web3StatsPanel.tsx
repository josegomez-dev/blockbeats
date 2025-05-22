// components/Web3StatsPanel.tsx
import React from "react";
import styles from "@/app/assets/styles/Web3StatsPanel.module.css";

const Web3StatsPanel = () => {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>📊 Web3 Stats & News</h2>

      <div className={styles.section}>
        <h4>🪙 Market Overview</h4>
        <ul>
          <li>ETH: $3,187 <span className={styles.green}>▲ +2.1%</span></li>
          <li>MATIC: $0.91 <span className={styles.red}>▼ -0.4%</span></li>
          <li>BTC: $64,203 <span className={styles.green}>▲ +1.5%</span></li>
        </ul>
      </div>

      <div className={styles.section}>
        <h4>📖 Quick Tutorials</h4>
        <ul>
          <li>🔐 How to Connect Wallet</li>
          <li>🎨 Mint your Music NFT</li>
          <li>🧠 Earn XP via Melodies</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h4>📰 News Feed</h4>
        <p>🎶 "New melodic quest unlocked! Compose a 3-note loop."</p>
        <p>⚙️ DAO update voting ends tomorrow.</p>
        <p>🚀 Web3 game partnership announced.</p>
      </div>
    </div>
  );
};

export default Web3StatsPanel;
