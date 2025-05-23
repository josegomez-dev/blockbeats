"use client";
import React, { useState, useEffect } from "react";
import styles from "@/app/assets/styles/CharacterPanel.module.css";
import toast from "react-hot-toast";
import LevelUpOverlay from "./LevelUpOverlay";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext'

const CharacterPanel = () => {
  const [energy, setEnergy] = useState(83);
  const [xp, setXP] = useState(67);
  const [level, setLevel] = useState(2);
  const [creativity, setCreativity] = useState(12);
  const [animateLevel, setAnimateLevel] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [messageOverlay, setMessageOverlay] = useState("");
  
  const { user } = useAuth();

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
            // Play sound when the component mounts
            playLevelUp2Sound();
            playLevelUpSound();
            updateUserNotifications(newLevel)

            setTimeout(() => {
              setAnimateLevel(false);
              setShowOverlay(false);
            }, 3000);

            return newLevel;
          });

          return 0;
        }

        return nextXP;
      });

      setCreativity((prev) => (prev < 20 ? prev + 1 : 8));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateUserNotifications = (newLevel: number) => {    
    console.log("user: ", user);
    console.log("user id: ", user?.uid);
    if (user) {
      const userRef = doc(db, "accounts", user.id);
      const notificationId = uuidv4();
      const notificationMessage = `🎉 Level up! You've reached level ${newLevel}!`
      const notification = {
        id: notificationId,
        text: notificationMessage,
        visited: false,
        };
      updateDoc(userRef, {
        notifications: arrayUnion(notification),
      })
      .then(() => {
        console.log("Notification added successfully!");
      })
      .catch((error) => {
        console.error("Error adding notification: ", error);
      });
    }
  };


  const playLevelUpSound = () => {
    const audio = new Audio("/sounds/level-up.mp3");
    audio.volume = 0.6;
    audio.play();
  };

  const playLevelUp2Sound = () => {
    const audio = new Audio("/sounds/level-up-2.mp3");
    audio.volume = 0.6;
    audio.play();
  };

  // Compute phase image path from level
  const phase = Math.min(Math.floor(level / 2) + 1, 10); // example max 10 phases
  const avatarSrc = `/avatar/phase-${phase}.webp`;

  return (
    <div className={styles.panel}>
      {showOverlay && (
        <LevelUpOverlay
          message={messageOverlay}
          onClose={() => setShowOverlay(false)}
        />
      )}

      <p className={styles.description}>
        This is your personal music bot! <br />
        <strong>Level up</strong> by completing quests and earning XP!
      </p>

      <div className={styles.avatarContainer}>
        <img
          src={avatarSrc}
          alt="Character"
          className={`${styles.avatar} ${
            animateLevel ? styles.avatarEvolve : ""
          }`}
        />
        <p className={styles.status}>
          Level:{" "}
          <span
            className={`glitch ${animateLevel ? styles.levelUp : ""}`}
            data-text={level}
          >
            {level}
          </span>{" "}
          | XP:{" "}
          <span data-text={`${xp}%`} className="glitch">
            {xp}%
          </span>
        </p>
      </div>

      <div className={styles.bars}>
        <div className={styles.barGroup}>
          <div className={styles.barLabel}>
            <label>⚡ {energy}%</label>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.energyBar} style={{ width: `${energy}%` }} />
          </div>
          <p className={styles.barText}>Energy</p>
        </div>

        <div className={styles.barGroup}>
          <div className={styles.barLabel}>
            <label>🧠 {creativity * 5}%</label>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.creativityBar}
              style={{ width: `${creativity * 5}%` }}
            />
          </div>
          <p className={styles.barText}>Creativity</p>
        </div>

        <div className={styles.barGroup}>
          <div className={styles.barLabel}>
            <label>📈 {xp}%</label>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.xpBar} style={{ width: `${xp}%` }} />
          </div>
          <p className={styles.barText}>Experience</p>
        </div>
      </div>

      <p className={styles.description}>
        <strong>Boost your creativity</strong> with special items and rewards!
      </p>

      {/* <div style={{ display: "flex", justifyContent: "space-between", gap: "25px" }}>
        <button onClick={() => toast("icon Claim your Rewards!")} className={styles.evolveBtn}>
          🪙 Claim Rewards!
        </button>
        <button onClick={() => toast("icon Claim your Rewards!")} className={styles.evolveBtn}>
          🚀 Boosts
        </button>
      </div> */}
    </div>
  );
};

export default CharacterPanel;
