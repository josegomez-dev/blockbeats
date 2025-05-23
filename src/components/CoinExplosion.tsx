// components/CoinExplosion.tsx
"use client";
import React, { useEffect } from "react";

type Props = {
  originX: number;
  originY: number;
  count?: number;
  onComplete?: () => void;
};

const CoinExplosion = ({ originX, originY, count = 10, onComplete }: Props) => {
  useEffect(() => {
    const wallet = document.getElementById("wallet-icon");
    if (!wallet) return;

    const walletRect = wallet.getBoundingClientRect();
    const targetX = walletRect.left + walletRect.width / 2;
    const targetY = walletRect.top + walletRect.height / 2;

    const coins = Array.from({ length: count }).map((_, i) => {
      const coin = document.createElement("div");
      coin.className = 'coin';
      coin.style.left = `${originX}px`;
      coin.style.top = `${originY}px`;
      document.body.appendChild(coin);

      // Random scatter angle
      const angle = Math.random() * 2 * Math.PI;
      const radius = 80 + Math.random() * 40;
      const scatterX = originX + Math.cos(angle) * radius;
      const scatterY = originY + Math.sin(angle) * radius;

      setTimeout(() => {
        coin.style.transform = `translate(${scatterX - originX}px, ${scatterY - originY}px) scale(1.2)`;
      }, 10);

      setTimeout(() => {
        coin.style.transition = "transform 0.8s ease-in";
        coin.style.transform = `translate(${targetX - originX}px, ${targetY - originY}px) scale(0.3)`;
      }, 600);

      setTimeout(() => {
        coin.remove();
        if (i === count - 1 && onComplete) onComplete();
      }, 1500);

      return coin;
    });

    // Coin sound
    const audio = new Audio("/sounds/success.mp3");
    audio.play();

  }, [originX, originY, count, onComplete]);

  return null;
};

export default CoinExplosion;
