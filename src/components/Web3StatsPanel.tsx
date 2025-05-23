"use client";
import React, { useEffect, useState } from "react";
import styles from "@/app/assets/styles/Web3StatsPanel.module.css";

const newsItems = [
  "🎶 New melodic quest unlocked! Compose a 3-note loop.",
  "⚙️ DAO update voting ends tomorrow.",
  "🚀 Web3 game partnership announced.",
  "🎧 New synth instrument unlocked in the NFT lab.",
  "📈 Token market sees surge after community vote.",
  "🧩 Puzzle challenge released — win token rewards!",
  "🎤 Harmony Festival virtual stage opens next week.",
  "🧠 AI composer beta released to selected users.",
  "🌐 Multichain bridge for melody tokens goes live.",
  "📚 SoundTrackX publishing tool enters open beta.",
  "👥 New band collaboration feature now live!",
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
        <h4>📰 News Feed</h4>
        <div className={styles.newsSlider}>
          <p className={styles.newsText}>{newsItems[newsIndex]}</p>
          <div className={styles.dots}>
            {newsItems.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${
                  i === newsIndex ? styles.active : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>🪙 Market Overview</h4>
        <ul>
          {Object.entries(prices).map(([coin, { change, isPositive }]) => (
            <li key={coin}>
              {coin}: ${(1000 + Math.random() * 5000).toFixed(2)}{" "}
              <span className={isPositive ? styles.green : styles.red}>
                {isPositive ? "▲" : "▼"} {change}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h4>📖 Quick Tutorials</h4>
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
