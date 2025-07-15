'use client';

import React, { useEffect, useState } from 'react';
import styles from './../app/assets/styles/VegasMintGame.module.css';
import stylesMain from './../app/assets/styles/MainPage.module.css';
import LevelUpOverlay from './LevelUpOverlay';
import { useAuth } from '@/context/AuthContext';

const EMOJIS = ['🍒', '🍋', '🔔', '💎', '🍉', '⭐', '7️⃣'];

const MAX_SPINS = 3;
const COOLDOWN_SECONDS = 3;

interface VegasMintGameProps {
  onClose: () => void;
}

const VegasMintGame: React.FC<VegasMintGameProps> = ({ onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string[]>(['🍒', '🍋', '🔔']);
  const [isAnimating, setIsAnimating] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const { updateCoinsInFirestore } = useAuth();

  const playAudio = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch(err => console.warn('Autoplay failed:', err));
  };

  const playSound = (type: 'spin' | 'win') => {
    if (type === 'win') {
      playAudio('/sounds/level-up-2.mp3');
    } else {
      playAudio('/sounds/level-up.mp3');
    }
  };

  const checkWin = (items: string[]) => items.every(emoji => emoji === items[0]);

  const spin = () => {
    if (spinCount >= MAX_SPINS || spinning || hasWon || !canSpin) return;

    const nextSpin = spinCount + 1;
    setSpinning(true);
    setIsAnimating(true);
    playSound('spin');
    setCanSpin(false);
    setCooldown(COOLDOWN_SECONDS);

    setTimeout(() => {
      let newResult: string[];
      if (nextSpin === MAX_SPINS && Math.random() < 0.5) {
        const lucky = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        newResult = [lucky, lucky, lucky];
      } else {
        newResult = Array(3).fill(null).map(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
      }

      const isWin = checkWin(newResult);
      setResult(newResult);
      setSpinning(false);
      setIsAnimating(false);
      setSpinCount(nextSpin);

      if (isWin) {
        setHasWon(true);
        setGameOver(true);
        setShowOverlay(true);
        playSound('win');
      } else if (nextSpin === MAX_SPINS) {
        setGameOver(true);
      }
    }, 1200);
  };

  useEffect(() => {
    if (showOverlay) {
      const overlayTimer = setTimeout(() => setShowOverlay(false), 3000);
      return () => clearTimeout(overlayTimer);
    }
  }, [showOverlay]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    } else if (!canSpin && !spinning && !gameOver) {
      setCanSpin(true);
    }
    return () => clearTimeout(timer);
  }, [cooldown, canSpin, spinning, gameOver]);

  const claimRewards = async () => {
    playAudio('/sounds/coins.mp3');
    await updateCoinsInFirestore(100, `100 Coins Earned!`);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      {showOverlay && (
        <LevelUpOverlay message="🎉 YOU WON 100 BBC!" onClose={() => setShowOverlay(false)} />
      )}

      <div className={styles.machine}>
        <h1 className='glitch'>BlockBeats 3.0</h1>
        <h2>🎰 Vegas Reward Machine</h2>
        <hr />
        <br />

        <p className={styles.description}>
          Spin the lever to try your luck and match 3 emojis!<br /><br />
          {hasWon ? (
            <span className='glitch'>✨ YOU WON!</span>
          ) : (
            <>You can spin <span className='glitch'>{MAX_SPINS - spinCount}</span> more time{MAX_SPINS - spinCount !== 1 ? 's' : ''} today.</>
          )}
        </p>

        <div className={styles.slots}>
          {result.map((emoji, i) => (
            <div
              key={i}
              className={
                `${styles.slot} ${spinning ? styles.spinning : ''} ${isAnimating ? styles.animating : ''} ${hasWon ? styles.pulse : ''}`
              }
            >
              <span className={styles.emojiSymbol}>{emoji}</span>
            </div>
          ))}
        </div>

        <div className={styles.leverWrapper}>
          {!gameOver && (
            <button
              className={stylesMain.submitBtn}
              onClick={spin}
              disabled={spinning || !canSpin}
              style={{
                animation: spinning ? 'none' : undefined,
                background: canSpin ? 'var(--neon-color)' : 'gray',
                cursor: canSpin ? 'pointer' : 'not-allowed',
                color: canSpin ? 'var(--primary-color)' : '#aaa',
              }}
            >
              {spinning ? '🎲 Spinning...' : !canSpin ? `⏳ Wait ${cooldown}s...` : '🎯 Pull the Lever'}
            </button>
          )}

          {gameOver && (
            <>
              <p style={{ color: 'var(--neon-color)', textAlign: 'center', marginTop: '1rem' }}>
                {hasWon
                  ? '🎉 Congratulations! Claim your 100BBC reward.'
                  : '🌙 Try your luck again tomorrow!'}
              </p>
              {hasWon && (
                <button
                  className={stylesMain.submitBtn}
                  onClick={claimRewards}
                  disabled={!hasWon}
                  style={{
                    animation: hasWon ? undefined : 'none',
                    background: hasWon ? undefined : 'gray',
                    cursor: hasWon ? 'pointer' : 'not-allowed',
                    color: hasWon ? 'white' : '#aaa',
                    marginTop: '0.5rem',
                  }}
                >
                  🪙 Claim <span className='glitch'>100BBC</span> Rewards
                </button>
              )}
            </>
          )}
        </div>
        <hr />
        or &nbsp;
        <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
      </div>
    </div>
  );
};

export default VegasMintGame;
