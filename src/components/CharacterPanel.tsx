// CharacterPanel.tsx (Improved with constants)
"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/assets/styles/CharacterPanel.module.css";
import stylesMain from "@/app/assets/styles/MainPage.module.css";
import toast from "react-hot-toast";
import LevelUpOverlay from "./LevelUpOverlay";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { CHARACTER_ANIMATION_DELAY, CHARACTER_LEVELUP_DURATION, XP_INTERVAL } from "@/utils/constants/gameSettings";

const CharacterPanel = () => {
  const [energy, setEnergy] = useState(83);
  const [xp, setXP] = useState(67);
  const [level, setLevel] = useState(2);
  const [creativity, setCreativity] = useState(12);
  const [animateLevel, setAnimateLevel] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [messageOverlay, setMessageOverlay] = useState("");
  const [showGif, setShowGif] = useState(false);

  const { user, updateCoinsInFirestore } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => (prev < 100 ? prev + 1 : 60));
      setXP((prev) => {
        const nextXP = prev + 5;

        if (nextXP >= 100) {
          setLevel((lvl) => {
            const newLevel = lvl >= 10 ? 1 : lvl + 1;

            setAnimateLevel(true);
            setShowOverlay(true);
            setMessageOverlay(`🎉 Level up! You've reached level ${lvl + 1}!`);
            toast.success(`🔥 Evolución completada: Nivel ${newLevel}`);
            playLevelUp2Sound();
            updateUserNotifications(newLevel);
            setShowGif(true);

            setTimeout(() => {
              updateCoinsInFirestore(100, `100 Coins Claimed on level ${level}!`);
              playCoinsSound();
              setShowOverlay(false);
              playLevelUp2Sound();
              playLevelUpSound();
            }, CHARACTER_ANIMATION_DELAY);

            setTimeout(() => {
              setAnimateLevel(false);
              setShowGif(false);
            }, CHARACTER_ANIMATION_DELAY + CHARACTER_LEVELUP_DURATION);

            return newLevel;
          });
          return 0;
        }

        return nextXP;
      });

      setCreativity((prev) => (prev < 20 ? prev + 1 : 8));
    }, XP_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const updateUserNotifications = (newLevel: number) => {
    if (user) {
      const userRef = doc(db, "accounts", user.id);
      const notificationId = uuidv4();
      const notificationMessage = `🎉 Level up! You've reached level ${newLevel}! -- You're getting 100 BBC Coins Reward!`;
      const notification = {
        id: notificationId,
        text: notificationMessage,
        visited: false,
      };
      updateDoc(userRef, {
        notifications: arrayUnion(notification),
      }).catch((error) => console.error("Error adding notification: ", error));
    }
  };

  const triggerCoinAnimation = () => {
    const container = document.createElement("div");
    container.className = styles["coin-animation-container"];
    document.body.appendChild(container);

    for (let i = 0; i < 20; i++) {
      const coin = document.createElement("div");
      coin.className = styles.coin;
      coin.style.left = `${window.innerWidth / 2 + (Math.random() - 0.5) * 100}px`;
      coin.style.top = `${window.innerHeight / 2 + (Math.random() - 0.5) * 100}px`;
      container.appendChild(coin);

      setTimeout(() => coin.remove(), 1500);
    }

    setTimeout(() => container.remove(), 1600);
  };

  const playLevelUpSound = () => new Audio("/sounds/level-up.mp3").play();
  const playLevelUp2Sound = () => new Audio("/sounds/level-up-2.mp3").play();
  const playCoinsSound = () => new Audio("/sounds/coins.mp3").play();

  const handleRevenue = () => {
    setMessageOverlay("💰 100BBC Coins Claimed!");
    setShowOverlay(true);
    triggerCoinAnimation();
    playLevelUp2Sound();
    setTimeout(() => {
      setShowOverlay(false);
      setMessageOverlay("");
      playCoinsSound();
      updateCoinsInFirestore(100, `100 Coins Claimed on level ${level}!`);
    }, CHARACTER_ANIMATION_DELAY);
  };

  const phase = Math.min(Math.floor(level / 2) + 1, 10);
  const avatarSrc = `/avatar/phase-${phase}.webp`;

  return (
    <div className={styles.panel}>
      {showOverlay && (
        <LevelUpOverlay message={messageOverlay} onClose={() => setShowOverlay(false)} />
      )}

      <br />
      <p className={styles.description}>
        This is your personal music bot! <br />
        <strong>Level up</strong> by completing quests and earning XP!
      </p>

      <div className={styles.avatarContainer}>
        <img src={avatarSrc} alt="Character" className={`${styles.avatar} ${animateLevel ? styles.avatarEvolve : ""}`} />
        {showGif && <img src="/evolve.gif" alt="Level Up Animation" className={styles.levelUpGif} />}
        <p className={styles.status}>
          Level: <span className={`glitch ${animateLevel ? styles.levelUp : ""}`} data-text={level}>{level}</span> |
          XP: <span data-text={`${xp}%`} className="glitch">{xp}%</span>
        </p>
      </div>

      <div className={styles.bars}>
        <div className={styles.barGroup}>
          <div className={styles.barLabel}><label>⚡ {energy}%</label></div>
          <div className={styles.progressBar}><div className={styles.energyBar} style={{ width: `${energy}%` }} /></div>
          <p className={styles.barText}>Energy</p>
        </div>

        <div className={styles.barGroup}>
          <div className={styles.barLabel}><label>🧠 {creativity * 5}%</label></div>
          <div className={styles.progressBar}><div className={styles.creativityBar} style={{ width: `${creativity * 5}%` }} /></div>
          <p className={styles.barText}>Creativity</p>
        </div>

        <div className={styles.barGroup}>
          <div className={styles.barLabel}><label>📈 {xp}%</label></div>
          <div className={styles.progressBar}><div className={styles.xpBar} style={{ width: `${xp}%` }} /></div>
          <p className={styles.barText}>Experience</p>
        </div>
      </div>

      <p className={styles.description}><strong>Boost your creativity</strong> with special items and rewards!</p>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
        <button onClick={handleRevenue} className={stylesMain.submitBtn} style={{ fontSize: "0.6rem" }}>🪙 Claim Coins</button>
        <button disabled className={stylesMain.submitBtn} style={{ backgroundColor: "transparent", opacity: 0.5, animation: 'none', fontSize: "0.6rem" }}>🚀 Boosts</button>
      </div>
    </div>
  );
};

export default CharacterPanel;