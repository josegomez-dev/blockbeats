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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={`${styles.glitch}`} data-text="BlockBeats 3.0">BlockBeats 3.0</h2>
          <button 
            className={styles.modalCloseButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {/* Coin Image Section */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span style={{ fontSize: "10rem", color: "gold" }}>🎁</span>
          </div>

          {/* Claim Button */}
          <div style={{ textAlign: "center" }}>
            <button
              className={styles.submitBtn}
              onClick={onClaim}
              style={{
                background: "linear-gradient(135deg, #00ffc3, #0088ff)",
                border: "2px solid rgba(0, 255, 255, 0.3)",
                boxShadow: "0 8px 25px rgba(0, 255, 195, 0.5), 0 0 50px rgba(0, 136, 255, 0.3)",
                fontSize: "1.2rem",
                borderRadius: "50px",
                minWidth: "300px",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <span>
                ⏳ Claim 
                <span style={{ 
                  color: "gold", 
                  textShadow: "0 0 10px gold",
                  fontWeight: "bold"
                }}>
                  100 <span className="glitch" data-text="BBC">BBC</span>
                </span>
                <span style={{ 
                  color: "#ff4444", 
                  fontWeight: "bold",
                  textShadow: "0 0 10px #ff4444"
                }}>
                  {secondsLeft}s left
                </span>
              </span>
            </button>
          </div>

          {/* Info Text */}
          <div style={{ 
            textAlign: "center", 
            marginBottom: "2rem",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "1rem",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <p style={{ 
              fontSize: "1rem", 
              marginBottom: "0.5rem",
              color: "#ff6b6b",
              fontWeight: "bold"
            }}>
              ⚠️ Note: You can only claim rewards once every day.
            </p>
            <p style={{ 
              fontSize: "1rem", 
              color: "#ffffff",
              margin: "0"
            }}>
              💡 <strong>Tip:</strong> Complete quests to earn more rewards!
            </p>
          </div>

          {/* Close Button */}
          <div style={{ textAlign: "center" }}>
            <button
              className={styles.modalCancelButton}
              onClick={onClose}
              style={{
                background: "transparent",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                padding: "0.75rem 2rem",
                borderRadius: "25px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              Close Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewardModal;
