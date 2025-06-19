"use client";

import React, { useEffect, useState } from "react";
import styles from "@/app/assets/styles/Web3StatsPanel.module.css";
import stylesChar from "@/app/assets/styles/CharacterPanel.module.css";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import { FaCoins } from 'react-icons/fa';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const newsItems = [
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
  // {
  //   text: "🚀 The Future of Gaming & Music Is HERE 🎮🎵 | BlockBeats Holographic Arena Reveal!",
  //   url: "https://www.youtube.com/watch?v=xm516bJeQOg",
  // },
  {
    text: "🎰 Spin to WIN! The Mint Machine by BlockBeats 3.0!",
    url: "https://www.youtube.com/watch?v=-adNKTEbynI",
  },
  {
    text: "🌆 Smart Light City by BlockBeats 3.0!",
    url: "https://www.youtube.com/watch?v=VmtUS50OEA8",
  },
  {
    text: "🚁 Turning the Sky Into a Stage with Music, Blockchain & Light ✨",
    url: "https://www.youtube.com/watch?v=3SxxMuSFfEo",
  },
  {
    text: "❤️‍🩹 Drones for Art, Not War!",
    url: "https://www.youtube.com/watch?v=ZKzrGB9VxBM",
  },
  {
    text: "🎧 BlockBeats | Music for Everyone!",
    url: "https://www.youtube.com/watch?v=aSXn2tCq9LE",
  },
];

const getTutorialLink = (type: string, step: number) => {
  return `/tutorials?tutorial=${type}&step=${step}`;
};

const tutorials = [
  { label: "🌐 What is a Wallet?", type: "wallet", step: 0 },
  { label: "🔐 How to Connect Wallet", type: "wallet", step: 1 },
  { label: "🎨 Create with Music Drawing Machine", type: "drawing", step: 0 },
  { label: "🎛️ Advanced Drawing Tips", type: "drawing", step: 1 },
  { label: "🪙 Mint & Share Your NFT", type: "nft", step: 0 },
  { label: "📢 Promote Your NFT", type: "nft", step: 1 },
  { label: "🤝 Join the BlockBeats Community", type: "community", step: 0 },
  { label: "📺 Follow our YouTube Channel", type: "community", step: 1 },
];

const getRandomChange = () => {
  const change = (Math.random() * 4 - 2).toFixed(2);
  return {
    change,
    isPositive: parseFloat(change) >= 0,
  };
};

const Sparkline = ({ data, color = "green" }: { data: number[]; color?: string }) => {
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        data,
        borderColor: color,
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: { borderCapStyle: 'round' as const },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return <Line data={chartData} options={options} />;
};

const Web3StatsPanel = () => {
  const [prices, setPrices] = useState({
    ETH: getRandomChange(),
    BTC: getRandomChange(),
    SOL: getRandomChange(),
    BBEATS: getRandomChange(),
  });

  const [newsIndex, setNewsIndex] = useState(0);
  const newsLength = newsItems.length;

  const [sparkData, setSparkData] = useState<Record<string, number[]>>({});

  const {user} = useAuth();

  // Simulate auto-updating sparkline data
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkData((prevData) => {
        const newData = { ...prevData };
        Object.keys(prices).forEach((coin) => {
          if (!newData[coin]) newData[coin] = [];
          const nextValue = 1000 + Math.random() * 5000;
          newData[coin] = [...newData[coin].slice(-20), nextValue]; // keep last 20 points
        });
        return newData;
      });
    }, 1000); // update every second
    return () => clearInterval(interval);
  }, [prices]);

  useEffect(() => {
    const priceInterval = setInterval(() => {
      setPrices({
        ETH: getRandomChange(),
        BTC: getRandomChange(),
        SOL: getRandomChange(),
        BBEATS: getRandomChange(),
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
    <div className={styles.panel} id="web3-stats-panel">
      <h2 className={styles.title} style={{ color: "white" }}>
        📊 Web3 Stats & News
      </h2>

      <div className={styles.section}>
        <div className={styles.newsSlider}>
          {newsItems[newsIndex].url ? (
            <a
              href={newsItems[newsIndex].url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.newsText}
              style={{ color: "var(--neon-color)" }}
            >
              {newsItems[newsIndex].text}
            </a>
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
        <h5 style={{ textAlign: 'center'}}>Account / Market Overview</h5>
        <div
          style={{
            maxHeight: "170px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "row",
            gap: "25px",
          }}
        >
          <ul>
            <li className={styles.coinsContainer} style={{ width: "100%" }}>
              <div className={styles.coinRow}>
                <p style={{ textAlign: "left" }}>
                  🪙 &nbsp;
                  <strong className="glitch">BBC</strong>: {user?.bbcPoints}
                </p>
                <hr />
                <p style={{ textAlign: "left" }}>
                  <Image
                    src="/logo.webp"
                    alt="BBC Logo"
                    width={30}
                    height={30}
                    style={{ verticalAlign: "middle" }}
                  />
                  <strong>NFTs</strong>: 4 | <strong>List</strong>: 2
                </p>
                <hr />
                <p className={styles.status}>
                  Level:{" "}
                  <span
                    className={`glitch`}
                    data-text={'2'}
                  >
                    {2}
                  </span>{" "}
                  | XP:{" "}
                  <span data-text={`${50}%`} className="glitch">
                    {50}%
                  </span>
                </p>
                <hr />
                <p style={{ textAlign: "left" }}>
                  ⚡ Energy: <label> 50%</label>

                  <div className={stylesChar.barGroup}>
                    <div className={stylesChar.barLabel}>
                      {/* <label>🧠 {creativity * 5}%</label> */}
                    </div>
                    <div className={stylesChar.progressBar} style={{ width: `100%` }}>
                      <div
                        className={stylesChar.energyBar}
                        // style={{ width: `${creativity * 5}%` }}
                        style={{ width: `50%` }}
                      />
                    </div>
                    <p className={stylesChar.barText}></p>
                  </div>
                </p>
                <p style={{ textAlign: "left" }}>
                  🧠 Creativity: <label> 50%</label>

                  <div className={stylesChar.barGroup}>
                    <div className={stylesChar.barLabel}>
                      {/* <label>🧠 {creativity * 5}%</label> */}
                    </div>
                    <div className={stylesChar.progressBar} style={{ width: `100%` }}>
                      <div
                        className={stylesChar.creativityBar}
                        // style={{ width: `${creativity * 5}%` }}
                        style={{ width: `50%` }}
                      />
                    </div>
                    <p className={stylesChar.barText}></p>
                  </div>
                </p>
                <p style={{ textAlign: "left" }}>
                  📈 Experience: <label> 50%</label>

                  <div className={stylesChar.barGroup}>
                    <div className={stylesChar.barLabel}>
                      {/* <label>🧠 {creativity * 5}%</label> */}
                    </div>
                    <div className={stylesChar.progressBar} style={{ width: `100%` }}>
                      <div
                        className={stylesChar.xpBar}
                        // style={{ width: `${creativity * 5}%` }}
                        style={{ width: `50%` }}
                      />
                    </div>
                    <p className={stylesChar.barText}></p>
                  </div>
                </p>
              </div>
            </li>
          </ul>
          <ul>
            <p style={{ textAlign: "left" }}>
              <FaCoins color="gold" /> &nbsp;
              <strong className="glitch">token</strong>: $
                  {(sparkData.ETH?.slice(-1)[0] || 1000).toFixed(0)}{" "}
            </p>
            {Object.entries(prices).map(([coin, { change, isPositive }]) => (
              <li className={styles.coinsContainer} key={coin}>
                <div className={styles.coinRow}>
                  <div>
                    <FaCoins color="gold" /> &nbsp;
                    <strong>{coin}</strong>: $
                    {(sparkData[coin]?.slice(-1)[0] || 1000).toFixed(2)}{" "}
                    <span
                      className={`${styles.coinsText} ${
                        isPositive ? styles.green : styles.red
                      }`}
                    > <br />
                      {isPositive ? "▲" : "▼"} {change}%
                    </span>
                  </div>
                  <div style={{ width: "120px", height: "30px" }}>
                    <Sparkline
                      data={sparkData[coin] || []}
                      color={isPositive ? "green" : "red"}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.section}>
        <h5>📖 Quick Tutorials</h5>
        <div className={styles.tutorialSlider}>
          {tutorials.map((item, i) => (
            <Link
              key={i}
              href={getTutorialLink(item.type, item.step)}
              className={styles.tutorialInner}
            >
              <div
                className={`${styles.tutorialItem}`}
                style={{ color: "var(--neon-color)" }}
              >
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Web3StatsPanel;
