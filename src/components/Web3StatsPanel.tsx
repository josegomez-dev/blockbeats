"use client";
import React, { useEffect, useState } from "react";
import styles from "@/app/assets/styles/Web3StatsPanel.module.css";

const newsItems = [
  {
    text: "🎶 New melodic quest unlocked! Compose a 3-note loop.",
    url: null,
  },
  {
    text: "📺 Watch the full demo presentation on YouTube!",
    url: "https://www.youtube.com/watch?v=W84Qst6bHxU&t=20s",
  },
  {
    text: "🏆 BlockBeats won 2nd place at the Starknet Hackathon!",
    url: "https://www.youtube.com/watch?v=Uk9lCM9xS5Y",
  },
  {
    text: "🌍 Web3 Music Revolution Starts Here",
    url: "https://www.youtube.com/watch?v=6aGIqnu1UP8",
  },
];


const tutorials = [
  "🔐 How to Connect Wallet",
  "🎨 Mint your Music NFT",
  "🧠 Earn XP via Melodies",
  "📤 Upload & Publish Your First Track",
  "🎛️ Customize Your NFT Sound Identity",
  "🧬 Link Traits to Melodic Elements",
  "🎹 Use the Music Drawing Machine",
  "💾 Save and Share Your NFT Melody",
  "🖼️ Add Visual Art to Your Composition",
  "🪙 Swap Tokens for Rare Audio FX",
  "📊 Track Your Stats & Progress",
  "📬 Join a Band & Send Invites",
];


const getRandomChange = () => {
  const change = (Math.random() * 4 - 2).toFixed(2);
  return {
    change,
    isPositive: parseFloat(change) >= 0,
  };
};

const Web3StatsPanel = () => {
  const [prices, setPrices] = useState({
    ETH: getRandomChange(),
    MATIC: getRandomChange(),
    BTC: getRandomChange(),
  });

  const [newsIndex, setNewsIndex] = useState(0);
  const newsLength = newsItems.length;


  useEffect(() => {
    const priceInterval = setInterval(() => {
      setPrices({
        ETH: getRandomChange(),
        MATIC: getRandomChange(),
        BTC: getRandomChange(),
      });
    }, 1500);

    const newsInterval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsLength);
    }, 2000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(newsInterval);
    };
  }, []);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>📊 Web3 Stats & News</h2>

      <div className={styles.section}>
        <h5>📰 News Feed</h5>
        <div className={styles.newsSlider}>
          {newsItems[newsIndex].url ? (
            <>
              🍿 Youtube:{" "}
              <a
                href={newsItems[newsIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsText}
                style={{ color: "var(--neon-color)" }}
              >
                {newsItems[newsIndex].text}
              </a>
            </>
          ) : (
            <p className={styles.newsText}>{newsItems[newsIndex].text}</p>
          )}
          <div className={styles.dots}>
            {newsItems.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === newsIndex ? styles.active : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h5>🪙 Market Overview</h5>
        <ul>
          {Object.entries(prices).map(([coin, { change, isPositive }]) => (
            <li className={styles.coinsContainer} key={coin}>
              {coin}: ${(1000 + Math.random() * 5000).toFixed(2)}{" "}
              <span className={`${styles.coinsText} ${isPositive ? styles.green : styles.red}`}>
                {isPositive ? "▲" : "▼"} {change}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h5>📖 Quick Tutorials</h5>
        <div className={styles.tutorialSlider}>
          <div
            className={styles.tutorialInner}
            // style={{
            //   transform: `translateY(-${tutorialIndex * 33.33}%)`,
            //   transition: "transform 0.5s ease-in-out",
            // }}
          >
            {tutorials.concat(tutorials).map((text, i) => (
              <div key={i} className={styles.tutorialItem}>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Web3StatsPanel;
