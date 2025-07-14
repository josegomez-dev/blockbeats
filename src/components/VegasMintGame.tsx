'use client';
import React, { useEffect, useState } from 'react';
import styles from './../app/assets/styles/VegasMintGame.module.css';
import stylesMain from './../app/assets/styles/MainPage.module.css';
import PixelPreview from './PixelPreview';
import { NFTData } from '@/types/nftTypes';
import LevelUpOverlay from './LevelUpOverlay';
import { useAuth } from '@/context/AuthContext';

interface VegasMintGameProps {
  onClose: () => void;
  nfts: NFTData[];
}

type Pixel = {
  noteIndex: number;
  time: number;
  color: string;
};

const MAX_SPINS = 3;
const COOLDOWN_SECONDS = 3;

const VegasMintGame: React.FC<VegasMintGameProps> = ({ onClose, nfts }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<NFTData[]>([nfts[0], nfts[1], nfts[2]]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const { updateCoinsInFirestore } = useAuth(); 

  const playSound = (type: 'spin' | 'win') => {
    if (type === 'win') {
      new Audio('/sounds/level-up-2.mp3').play();
      setTimeout(() => new Audio('/sounds/coins.mp3').play(), 500);
    } else {
      new Audio('/sounds/level-up.mp3').play();
    }
  };

  const checkWin = (items: NFTData[]) => {
    const [first, ...rest] = items.map(n => n.songName);
    return rest.every(name => name === first);
  };

  const spin = () => {
    if (spinCount >= MAX_SPINS || spinning || hasWon || !canSpin) return;

    setSpinning(true);
    setIsAnimating(true);
    playSound('spin');
    setCanSpin(false);
    setCooldown(COOLDOWN_SECONDS);

    setTimeout(() => {
      let newResult: NFTData[];

      // 🎯 Higher chance to win on 3rd spin
      if (spinCount === 2 && Math.random() < 0.5) {
        const lucky = nfts[Math.floor(Math.random() * nfts.length)];
        newResult = [lucky, lucky, lucky];
      } else {
        newResult = Array(3)
          .fill(null)
          .map(() => nfts[Math.floor(Math.random() * nfts.length)]);
      }

      const isWin = checkWin(newResult);
      setResult(newResult);
      setSpinning(false);
      setIsAnimating(false);
      setSpinCount(prev => prev + 1);

      if (isWin) {
        setHasWon(true);
        setGameOver(true);
        setShowOverlay(true);
        playSound('win');

        setTimeout(() => {
          setShowOverlay(false);
        }, 3000);
      } else if (spinCount + 1 === MAX_SPINS) {
        setGameOver(true);
      }
    }, 1500);
  };

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
    new Audio('/sounds/coins.mp3').play();
    await updateCoinsInFirestore(100, `100 Coins Earned!`);
    onClose();
  };

  return (
    <div className={styles.overlay}>

      {showOverlay && (
        <LevelUpOverlay
          message="🎉 YOU WON 100 BBC!"
          onClose={() => setShowOverlay(false)}
        />
      )}

      <div className={styles.machine}>
        <h1 className={styles.title}>🎰 Mint Machine</h1>
        <p className={styles.description}>
          Spin the lever to mint a random NFT or earn a chance to win a special NFT!<br /><br />
          {hasWon ? (
            <span className='glitch'>✨ YOU WON!</span>
          ) : (
            <>
              You can spin <span className='glitch'>{MAX_SPINS - spinCount}</span> more time{MAX_SPINS - spinCount !== 1 ? 's' : ''} today.
            </>
          )}
        </p>

        <br />
        <br />
        <div className={styles.slots}>
          {result.map((nft, i) => (
            <div
              key={i}
              className={`
                ${styles.slot}
                ${spinning ? styles.spinning : ''}
                ${isAnimating ? styles.animating : ''}
                ${hasWon ? styles.pulse : ''}
              `}
            >
              <PixelPreview
                colorMap={(
                  Array.isArray(nft.colorMap)
                    ? nft.colorMap
                    : typeof nft.colorMap === 'string'
                      ? JSON.parse(nft.colorMap)
                      : []
                ).map((pixel: Pixel) => ({
                  noteIndex: pixel.noteIndex,
                  time: pixel.time,
                  color: pixel.color,
                }))}
                notesCount={12}
                size={50}
                style={{ marginTop: '0.5rem' }}
                backgroundColor={nft.color || '#000000'}
              />
              <p className={styles.nftTitle}>{nft.songName}</p>
              <span className={styles.nftAuthor}>
                by {nft.createdBy ? nft.createdBy.slice(0, 6) : 'Unknown'}...
              </span>
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
              {spinning
                ? '🎲 Spinning...'
                : !canSpin
                ? `⏳ Wait ${cooldown}s...`
                : '🎯 Pull the Lever'}
            </button>
          )}

          {gameOver && (
            <>
              <p style={{ color: 'var(--neon-color)', textAlign: 'center', marginTop: '1rem' }}>
                {hasWon
                  ? '🎉 Congratulations! Claim your 100BBC reward.'
                  : '🌙 Try your luck again tomorrow!'}
              </p>
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
            </>
          )}
        </div>

        <button className={styles.exitButton} onClick={onClose}>❌ Exit</button>
      </div>
    </div>
  );
};

export default VegasMintGame;
