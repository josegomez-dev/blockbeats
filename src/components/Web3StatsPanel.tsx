"use client";
import React, { useEffect, useState } from "react";
import styles from "@/app/assets/styles/Web3StatsPanel.module.css";
import Link from "next/link";

const newsItems = [
  // {
  //   text: "🎶 New melodic quest unlocked! Compose a 3-note loop.",
  //   url: null,
  // },
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
  {
    text: "🚀 The Future of Gaming & Music Is HERE 🎮🎵 | BlockBeats Holographic Arena Reveal!",
    url: "https://www.youtube.com/watch?v=xm516bJeQOg",
  },
  {
    text: "🎰 Spin to WIN! The Mint Machine by BlockBeats — NFTs Meet the Thrill of Surprise! 🚀🎵",
    url: "https://www.youtube.com/watch?v=-adNKTEbynI",
  },
  {
    text: "🌆 Smart Light City by BlockBeats — When Architecture Becomes Alive! 🚀🎵",
    url: "https://www.youtube.com/watch?v=VmtUS50OEA8",
  },
  {
    text: "🚁 BlockBeats Drone Show | Turning the Sky Into a Stage with Music, Blockchain & Light ✨🎶",
    url: "https://www.youtube.com/watch?v=3SxxMuSFfEo",
  },
  {
    text: "🚁 BlockBeats Drone Show | Turning the Sky Into a Stage with Music, Blockchain & Light ✨🎶",
    url: "https://www.youtube.com/watch?v=JMBUPRZ3cYk",
  },
  {
    text: "🎙️ BlockBeats | Music for Everyone 🎶✨ – Inclusive Music Drawing & NFTs for Deaf & Blind Creators 🚀",
    url: "https://www.youtube.com/watch?v=aSXn2tCq9LE",
  },
];


const tutorials = [
  "🔐 How to Connect Wallet",
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
          <Link
            href="/tutorials"
            className={styles.tutorialInner}
            // style={{
            //   transform: `translateY(-${tutorialIndex * 33.33}%)`,
            //   transition: "transform 0.5s ease-in-out",
            // }}
          >
            {tutorials.map((text, i) => (
              <div key={i} className={`${styles.tutorialItem }`} style={{ color: 'var(--neon-color)' }}>
                {text}
              </div>
            ))}
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Web3StatsPanel;
