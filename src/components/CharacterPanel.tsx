'use client';

import React, { useEffect, useReducer, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import LevelUpOverlay from './LevelUpOverlay';
import styles from '@/app/assets/styles/CharacterPanel.module.css';
import stylesMain from '@/app/assets/styles/MainPage.module.css';
import { db } from '../../firebase';
import { useAuth } from '../context/AuthContext';
import {
  CHARACTER_ANIMATION_DELAY,
  CHARACTER_LEVELUP_DURATION,
} from '@/utils/constants/gameSettings';
import { CHARACTER_STATS } from '@/utils/constants/characterStats';

// ────────────────────────────────────────────────────────────────────────────────
// TYPES & REDUCER
// ────────────────────────────────────────────────────────────────────────────────
type StatState = {
  energy: number;
  creativity: number;
  xp: number;
  level: number;
};

const MAX_LEVEL = 10;
const MAX_PHASE = 6;
const MIN_PHASE = 0;
const LEVEL_XP_THRESHOLD = 100;

const initialState: StatState = {
  energy: 0,
  creativity: 0,
  xp: 0,
  level: 1,
};

type Action =
  | { type: 'INCREMENT_STATS'; payload: Partial<StatState> }
  | { type: 'LEVEL_UP' }
  | { type: 'RESET' };

const reducer = (state: StatState, action: Action): StatState => {
  switch (action.type) {
    case 'INCREMENT_STATS': {
      const newXP = state.xp + (action.payload.xp || 0);
      const newLevel = newXP >= LEVEL_XP_THRESHOLD && state.level < MAX_LEVEL
        ? state.level + 1
        : state.level;
      return {
        ...state,
        energy: Math.min(100, state.energy + (action.payload.energy || 0)),
        creativity: Math.min(100, state.creativity + (action.payload.creativity || 0)),
        xp: newXP >= LEVEL_XP_THRESHOLD ? 0 : newXP,
        level: newLevel,
      };
    }
    case 'LEVEL_UP':
      return { ...state, level: Math.min(state.level + 1, MAX_LEVEL), xp: 0 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // format: "2025-06-25"
};

const getClaimKey = (userId: string) => `lastClaimDate_${userId}`;

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────────
const CharacterPanel: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { energy, creativity, xp, level } = state;

  const { user, updateCoinsInFirestore } = useAuth();
  const [overlayMsg, setOverlayMsg] = useState<string | null>(null);
  const [animateLevel, setAnimateLevel] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(1);

  const canClaim = useRef<boolean>(true);
  const prevLevel = useRef(level);

  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const lastClaim = localStorage.getItem(getClaimKey(user.id));
    if (lastClaim === getTodayDateString()) {
      setHasClaimedToday(true);
      canClaim.current = false;
    }
  }, [user]);


  const sfx = useRef({
    levelUp1: new Audio('/sounds/level-up.mp3'),
    levelUp2: new Audio('/sounds/level-up-2.mp3'),
    coins: new Audio('/sounds/coins.mp3'),
  });

  // Auto increase stats
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({
        type: 'INCREMENT_STATS',
        payload: {
          energy: Math.random() * 3,
          creativity: Math.random() * 2,
          xp: Math.random() * 5,
        },
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Detect level up
  useEffect(() => {
    if (level > prevLevel.current) {
      prevLevel.current = level;
      if (level <= MAX_PHASE) {
        handleLevelUp(level);
        setPhaseIndex(level);
      }
    }
  }, [level]);

  const handleLevelUp = async (newLevel: number) => {
    setAnimateLevel(true);
    setShowGif(true);
    setOverlayMsg(`🎉 Level up! You reached level ${newLevel}!`);
    toast.success(`🔥 Evolución completada: Nivel ${newLevel}`);
    sfx.current.levelUp2.play();

    await pushNotificationToUser(newLevel);

    setTimeout(async () => {
      sfx.current.coins.play();
      await updateCoinsInFirestore(100, `100 Coins claimed on level ${newLevel}!`);
      triggerCoinAnimation();
    }, CHARACTER_ANIMATION_DELAY);

    setTimeout(() => {
      setAnimateLevel(false);
      setShowGif(false);
      setOverlayMsg(null);
    }, CHARACTER_ANIMATION_DELAY + CHARACTER_LEVELUP_DURATION);
  };

  const pushNotificationToUser = async (newLevel: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'accounts', user.id);
      const notification = {
        id: uuidv4(),
        text: `🎉 Level up! You've reached level ${newLevel}! — 100 BBC Coins awarded.`,
        visited: false,
      };
      await updateDoc(userRef, { notifications: arrayUnion(notification) });
    } catch (e) {
      console.error('Error adding notification:', e);
    }
  };

  const triggerCoinAnimation = () => {
    const container = document.createElement('div');
    container.className = styles['coin-animation-container'];
    document.body.appendChild(container);

    [...Array(20)].forEach(() => {
      const coin = document.createElement('div');
      coin.className = styles.coin;
      coin.style.left = `${window.innerWidth / 2 + (Math.random() - 0.5) * 100}px`;
      coin.style.top = `${window.innerHeight / 2 + (Math.random() - 0.5) * 100}px`;
      container.appendChild(coin);
      setTimeout(() => coin.remove(), 1500);
    });

    setTimeout(() => container.remove(), 1600);
  };

  const handleClaim = async () => {
    if (!canClaim.current || hasClaimedToday || !user) return;

    canClaim.current = false;
    setHasClaimedToday(true);
    localStorage.setItem(getClaimKey(user.id), getTodayDateString());

    setOverlayMsg('💰 100 BBC Coins Claimed!');
    sfx.current.levelUp1.play();
    triggerCoinAnimation();

    setTimeout(async () => {
      await updateCoinsInFirestore(100, `Manual claim at level ${level}`);
      sfx.current.coins.play();
      setOverlayMsg(null);
    }, CHARACTER_ANIMATION_DELAY);
  };

  const avatarSrc = `/avatar/phase-${phaseIndex}.webp`;

  const changePhase = (dir: 'prev' | 'next') => {
    const newIndex = dir === 'next'
      ? Math.min(phaseIndex + 1, MAX_PHASE)
      : Math.max(phaseIndex - 1, MIN_PHASE);
    setPhaseIndex(newIndex);
    handleLevelUp(newIndex);
  };

  const STAT_VALUES: Record<string, number> = {
    energy: energy,
    creativity: creativity,
    experience: xp,
  };

  return (
    <div className={styles.panel}>
      {overlayMsg && <LevelUpOverlay message={overlayMsg} onClose={() => setOverlayMsg(null)} />}

      <h2> <span className='glitch'>BEATO</span> </h2>
      <p className={styles.description}>
        This is your personal music bot!<br />
        <strong>Level up</strong> by completing quests and earning XP!
      </p>


      <div className={styles.bars}>
        {CHARACTER_STATS.map(({ key, label, icon }) => (
          <div key={key} className={styles.barGroup}>
            <div className={styles.barLabel}>
              <label>
                {icon} {Math.floor(STAT_VALUES[key])}%
              </label>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles[`${key}Bar`]}
                style={{ width: `${Math.min(100, STAT_VALUES[key])}%` }}
              />
            </div>
            <p className={styles.barText}>{label}</p>
          </div>
        ))}
      </div>

      <div className={styles.avatarContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <button onClick={() => changePhase('prev')} disabled={phaseIndex === MIN_PHASE + 1} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            ⬅️
          </button>
          <button onClick={() => changePhase('next')} disabled={phaseIndex === MAX_PHASE} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            ➡️
          </button>
        </div>

        <img
          src={avatarSrc}
          alt="Character"
          className={`${styles.avatar} ${animateLevel ? styles.avatarEvolve : ''}`}
        />
        {showGif && <img src="/evolve.gif" alt="evolving" className={styles.levelUpGif} />}
        <p className={styles.status}>
          Level:{' '}
          <span className={`glitch ${animateLevel ? styles.levelUp : ''}`} data-text={level}>
            {phaseIndex}
          </span>{' '}
          | XP:{' '}
          <span data-text={`${Math.floor(xp)}%`} className="glitch">
            {Math.floor(xp)}%
          </span>
        </p>
      </div>

      <p className={styles.description}>
        <strong>Boost your creativity</strong> with special items and rewards!
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
        <button
          onClick={handleClaim}
          className={stylesMain.submitBtn}
          style={{ fontSize: '0.6rem', opacity: hasClaimedToday ? 0.5 : 1, animation: hasClaimedToday ? 'none' : '' }}
          disabled={hasClaimedToday}
        >
          {hasClaimedToday ? '✅ Already Claimed Today' : '🪙 Claim Coins'}
        </button>

        {/* <button
          disabled
          className={stylesMain.submitBtn}
          style={{ backgroundColor: 'transparent', opacity: 0.5, animation: 'none', fontSize: '0.6rem' }}
        >
          🚀 Boosts
        </button> */}
      </div>
    </div>
  );
};

export default CharacterPanel;
