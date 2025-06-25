// Improved Web3StatsPanel.tsx
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
import { BLOCKBEATS_TUTORIALS } from "@/utils/constants/tutorials";
import { BLOCKBEATS_NEWS } from "@/utils/constants/news";
import { CHARACTER_STATS } from "@/utils/constants/characterStats";
import { BiCollection } from "react-icons/bi";
import { RiGalleryLine } from "react-icons/ri";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const getTutorialLink = (type: string, step: number) => `/tutorials?tutorial=${type}&step=${step}`;

const getRandomChange = () => {
  const change = (Math.random() * 4 - 2).toFixed(2);
  return { change, isPositive: parseFloat(change) >= 0 };
};

const Sparkline = ({ data, color = "green" }: { data: number[]; color?: string }) => {
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [{
      data,
      borderColor: color,
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false } },
    elements: { line: { borderCapStyle: 'round' as const } },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  return <Line data={chartData} options={options} />;
};

// Props interface
interface Web3StatsPanelProps {
  totalNFTCreations: number;
  totalTopCollections: number;
}

const Web3StatsPanel: React.FC<Web3StatsPanelProps> = ({ totalNFTCreations, totalTopCollections }) => {
  const [prices, setPrices] = useState({ ETH: getRandomChange(), BBEATS: getRandomChange() });
  const [newsIndex, setNewsIndex] = useState(0);
  const [sparkData, setSparkData] = useState<Record<string, number[]>>({});
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkData((prevData) => {
        const newData = { ...prevData };
        Object.keys(prices).forEach((coin) => {
          if (!newData[coin]) newData[coin] = [];
          const nextValue = 1000 + Math.random() * 5000;
          newData[coin] = [...newData[coin].slice(-20), nextValue];
        });
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [prices]);

  useEffect(() => {
    const priceInterval = setInterval(() => {
      setPrices({ ETH: getRandomChange(), BBEATS: getRandomChange() });
    }, 1500);

    const newsInterval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % BLOCKBEATS_NEWS.length);
    }, 2000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(newsInterval);
    };
  }, []);

  return (
    <div className={styles.panel} id="web3-stats-panel">
      <h2 className={styles.title}>📊 Web3 Stats & News</h2>

      <div className={styles.section}>
        <div className={styles.newsSlider}>
          {BLOCKBEATS_NEWS[newsIndex].url ? (
            <a
              href={BLOCKBEATS_NEWS[newsIndex].url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.newsText}
            >
              {BLOCKBEATS_NEWS[newsIndex].text}
            </a>
          ) : (
            <p className={styles.newsText}>{BLOCKBEATS_NEWS[newsIndex].text}</p>
          )}
          <div className={styles.dots}>
            {BLOCKBEATS_NEWS.map((_, i) => (
              <span key={i} className={`${styles.dot} ${i === newsIndex ? styles.active : ""}`} />
            ))}
          </div>
        </div>
      </div>

      <h5 className={styles.subtitle}>
        <Image src="/logo.webp" alt="BBC Logo" width={30} height={30} /> DATA / MARKET OVERVIEW
      </h5>

      <div className={styles.section}>
        <div className={styles.coinListWrapper}>
          <ul>
            <h3>Account</h3>
            <hr />
            <li className={styles.coinsContainer}>
              <div className={styles.coinRow}>
                <p className={styles.tokenMeta}>lvl: <span className="glitch">2</span> | XP: <span className="glitch">50</span></p>
                <hr />
                <p className={styles.tokenMeta}><strong> <RiGalleryLine /> </strong>: <span className="glitch">{totalNFTCreations}</span> | <strong> <BiCollection /></strong>: <span className="glitch">{totalTopCollections}</span></p>
                <hr />
                <p className={styles.tokenStat}>PTS: {user?.bbcPoints} <strong className="glitch">BBC</strong></p>
                <hr />
                <p className={styles.tokenStat}><FaCoins color="gold" /> <strong>balance</strong>: <span className={styles.tokenValue}>${(0).toFixed(2)}</span></p>
              </div>
            </li>
          </ul>

          <ul className={styles.coinsContainer} style={{ width: "180px" }}>
            <h3>Bot Stats</h3>
            {CHARACTER_STATS.map(({ key, label, icon }) => (
              <div key={key} className={stylesChar.barWrapper} style={{ fontSize: 10}}>
                <hr />
                {icon} {label}: <label>50%</label>
                <div className={stylesChar.barGroup}>
                  <div className={stylesChar.progressBar}>
                    <div className={stylesChar[`${key}Bar`]} style={{ width: "50%" }} />
                  </div>
                </div>
              </div>
            ))}
          </ul>

          <ul>
            <h3>Tokens</h3>
            <hr />
            {Object.entries(prices).map(([coin, { change, isPositive }]) => (
              <li className={styles.coinsContainer} key={coin}>
                <div className={styles.coinRow}>
                  <div className={styles.coinLabel}><FaCoins color="gold" /> <strong>{coin}</strong>: ${(sparkData[coin]?.slice(-1)[0] || 1000).toFixed(2)}
                    <span className={`${styles.coinsText} ${isPositive ? styles.green : styles.red}`}>
                      {isPositive ? "▲" : "▼"} {change}%
                    </span>
                  </div>
                  <div className={styles.sparkContainer}>
                    <Sparkline data={sparkData[coin] || []} color={isPositive ? "green" : "red"} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h5 className={styles.subtitle}>📖 QUICK TUTORIALS</h5>
      <div className={styles.section}>
        <div className={styles.tutorialSlider}>
          {BLOCKBEATS_TUTORIALS.map((item, i) => (
            <Link key={i} href={getTutorialLink(item.type, item.step)} className={styles.tutorialInner}>
              <div className={styles.tutorialItem}>{item.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Web3StatsPanel;