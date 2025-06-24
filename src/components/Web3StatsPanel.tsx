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

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const getTutorialLink = (type: string, step: number) => {
  return `/tutorials?tutorial=${type}&step=${step}`;
};

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
    BBEATS: getRandomChange(),
  });

  const [newsIndex, setNewsIndex] = useState(0);
  const newsLength = BLOCKBEATS_NEWS.length;

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
          {BLOCKBEATS_NEWS[newsIndex].url ? (
            <a
              href={BLOCKBEATS_NEWS[newsIndex].url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.newsText}
              style={{ color: "var(--neon-color)" }}
            >
              {BLOCKBEATS_NEWS[newsIndex].text}
            </a>
          ) : (
            <p className={styles.newsText}>{BLOCKBEATS_NEWS[newsIndex].text}</p>
          )}
          <div className={styles.dots}>
            {BLOCKBEATS_NEWS.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === newsIndex ? styles.active : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      <h5 style={{ textAlign: 'center'}}>
        <Image
          src="/logo.webp"
          alt="BBC Logo"
          width={30}
          height={30}
          style={{ verticalAlign: "middle" }}
        />
          ACCOUNT / MARKET OVERVIEW
      </h5>
      <div className={styles.section}>
        <div
          style={{
            maxHeight: "170px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <ul>
            <li className={styles.coinsContainer} style={{ width: "100%" }}>
              <div className={styles.coinRow}>
                <p style={{ fontSize: "10px" }}>
                  PTS: {user?.bbcPoints} <strong className="glitch">BBC</strong>
                </p>
                <p style={{ textAlign: "left", fontSize: "12px" }}>
                  <FaCoins color="gold" /> &nbsp;
                  <strong className="glitch">token</strong>: &nbsp;
                      <span style={{ color: 'gold' }}>${(sparkData.ETH?.slice(-1)[0] || 1000).toFixed(0)}{" "}</span>
                </p>
                <hr />
                <p style={{ fontSize: "8px" }}>
                  <strong>NFTs</strong>: 4 | <strong>LISTS</strong>: 2
                </p>
                <hr />
                <p style={{ fontSize: "8px" }}>
                  LEVEL:{" "}
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
                <p style={{ textAlign: "left", fontSize: "8px" }}>
                  ⚡ ENERGY: <label> 50%</label>

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
                <p style={{ textAlign: "left", fontSize: "8px", marginTop: "-10px" }}>
                  🧠 CREATIVITY: <label> 50%</label>

                  <div className={stylesChar.barGroup}>
                    <div className={stylesChar.barLabel}>
                      {/* <label>🧠 {creativity * 5}%</label> */}
                    </div>
                    <div className={stylesChar.progressBar} style={{ width: `100%` }}>
                      <div
                        className={stylesChar.creativityBar}
                        // style={{ width: `${creativity * 5}%` }}
                        style={{ width: `50%`, fontSize: "10px" }}
                      />
                    </div>
                    <p className={stylesChar.barText}></p>
                  </div>
                </p>
                <p style={{ textAlign: "left", fontSize: "8px", marginTop: "-10px" }}>
                  📈 EXPERIENCE: <label> 50%</label>

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

            {Object.entries(prices).map(([coin, { change, isPositive }]) => (
              <li className={styles.coinsContainer} key={coin}>
                <div className={styles.coinRow}>
                  <div style={{ fontSize: '10px' }}>
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
      
      <h5 style={{ textAlign: 'center', marginBottom: 7 }}>📖 QUICK TUTORIALS</h5>

      <div className={styles.section}>
        <div className={styles.tutorialSlider}>
          {BLOCKBEATS_TUTORIALS.map((item, i) => (
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
