// components/DailyRewardModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/app/assets/styles/layouts/MainPage.module.css";

interface Props {
  onClose: () => void;
  onClaim: () => void;
}

const DailyRewardModal: React.FC<Props> = ({ onClose, onClaim }) => {
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClaim(); // trigger callback
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onClaim]);

  return (
    <div className="modal-content" style={{ textAlign: "center", width: "100%", margin: "10px auto" }}>
      <br />
      <h1 className={`title ${styles.glitch}`}>BlockBeats 3.0</h1>
      <button
        style={{ margin: "0 auto", background: "var(--neon-color)" }}
        className={styles.submitBtn}
        onClick={onClaim}
      >
        ⏳ Claim <span style={{ color: "gold" }}>100 <span className="glitch">BBC</span></span>&nbsp;
        <span style={{ color: "red" }}>{secondsLeft}s left</span>
      </button>

      <Image
        src="/images/avatars/phase-6.webp"
        alt="Coin"
        width={300}
        height={300}
        style={{
          display: "block",
          margin: "0 auto",
          marginTop: "10px",
          animation: "fadeIn 1s ease-in-out",
        }}
      />

      <p style={{ fontSize: "1.2rem", top: "-80px", marginBottom: "-50px" }}>
        <b style={{ color: "red" }}>Note: You can only claim rewards once every day.</b><br />
        <b style={{ color: "white" }}>Tip:</b> Complete quests to earn more rewards!
      </p>
<br />
<br />
<br />
      <button
        className={styles.submitBtn}
        style={{ background: "transparent" }}
        onClick={onClose}
      >
        Close Rewards
      </button>
    </div>
  );
};

export default DailyRewardModal;
