import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/assets/styles/Web3StatsPanel.module.css";

const newsItems = [
  "🎶 \"New melodic quest unlocked! Compose a 3-note loop.\"",
  "⚙️ DAO update voting ends tomorrow.",
  "🚀 Web3 game partnership announced.",
];

const Web3StatsPanel = () => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => setIndex((prev) => (prev + 1) % newsItems.length);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, []);

  const startAutoScroll = () => {
    stopAutoScroll();
    intervalRef.current = setInterval(nextSlide, 3000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      nextSlide();
    } else {
      setIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    }
    stopAutoScroll(); // optional: stop auto on manual scroll
  };

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

      <div
        className={`${styles.section} ${styles.newsSlider}`}
        onMouseEnter={stopAutoScroll}
        onMouseLeave={startAutoScroll}
        onWheel={handleWheel}
        ref={containerRef}
      >
        <h4>📰 News Feed</h4>
        <div className={styles.newsItem}>
          {newsItems[index]}
        </div>
      </div>
    </div>
  );
};

export default Web3StatsPanel;
