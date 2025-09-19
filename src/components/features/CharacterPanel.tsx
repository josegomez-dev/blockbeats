'use client';

import React, { useEffect, useReducer, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import LevelUpOverlay from '../modals/LevelUpOverlay';
import RobotNameModal from '../modals/RobotNameModal';
import styles from '@/app/assets/styles/components/CharacterPanel.module.css';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import {
  CHARACTER_ANIMATION_DELAY,
  CHARACTER_LEVELUP_DURATION,
} from '@/utils/constants/gameSettings';
import { xpService } from '@/utils/xpService';

// ────────────────────────────────────────────────────────────────────────────────
// TYPES & REDUCER
// ────────────────────────────────────────────────────────────────────────────────
type StatState = {
  energy: number;
  creativity: number;
  xp: number;
  level: number;
};

const MAX_LEVEL = 6;
const MAX_PHASE = 6;
const MIN_PHASE = 1;
const LEVEL_XP_THRESHOLD = 1000; // 1k XP per level

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

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────────
const CharacterPanel: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { energy, creativity, xp, level } = state;

  const { user, updateCoinsInFirestore } = useAuth();
  const [overlayMsg, setOverlayMsg] = useState<string | null>(null);
  const [animateLevel, setAnimateLevel] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(1);
  const [availablePhases, setAvailablePhases] = useState<number[]>([1]);
  const [maxUnlockedPhase, setMaxUnlockedPhase] = useState(1);
  const [robotName, setRobotName] = useState(user?.robotName || 'BEATO');
  const [showRobotNameModal, setShowRobotNameModal] = useState(false);

  const prevLevel = useRef(level);
  const sessionStartTime = useRef<number>(Date.now());
  const lastXPSave = useRef<number>(Date.now());

  const sfx = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sfx.current = {
        levelUp1: new Audio('/sounds/level-up.mp3'),
        levelUp2: new Audio('/sounds/level-up-2.mp3'),
        coins: new Audio('/sounds/coins.mp3'),
      };
    }
  }, []);

  // Load user's XP data from Firebase
  useEffect(() => {
    if (user) {
      loadUserXPData();
    }
  }, [user]);

  // Update robot name when user context changes
  useEffect(() => {
    if (user?.robotName) {
      setRobotName(user.robotName);
    }
  }, [user?.robotName]);

  // Subscribe to XP updates from the service
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = xpService.subscribeToXPUpdates((xp, level) => {
      dispatch({
        type: 'INCREMENT_STATS',
        payload: { xp, level }
      });
    });

    return unsubscribe;
  }, [user]);

  // Time-based XP system - award XP every minute of app usage
  useEffect(() => {
    if (!user) return;
    
    const timeInterval = setInterval(() => {
      const now = Date.now();
      const timeSpent = now - lastXPSave.current;
      
      // Award 1 XP for every minute (60000ms) spent on the app
      if (timeSpent >= 60000) {
        const minutesSpent = Math.floor(timeSpent / 60000);
        lastXPSave.current = now;
        xpService.awardTimeXP(user.uid, minutesSpent);
      }
    }, 60000); // Check every minute

    return () => clearInterval(timeInterval);
  }, [user]);

  const loadUserXPData = async () => {
    if (!user) return;
    
    try {
      const { xp, level, phase, totalXP } = await xpService.loadUserXPData(user.uid);
      const avatarData = await xpService.getUserAvatarData(user.uid);
      const currentRobotName = await xpService.getRobotName(user.uid);
      
      setPhaseIndex(avatarData.currentPhase);
      setAvailablePhases(avatarData.availablePhases);
      setMaxUnlockedPhase(avatarData.maxUnlockedPhase);
      setRobotName(currentRobotName);
      
      dispatch({
        type: 'INCREMENT_STATS',
        payload: { xp, level }
      });
    } catch (error) {
      console.error('Error loading user XP data:', error);
    }
  };


  // Detect level up and phase progression
  useEffect(() => {
    if (level > prevLevel.current) {
      prevLevel.current = level;
      const newPhase = Math.min(level, MAX_PHASE);
      
      if (newPhase > maxUnlockedPhase) {
        handleLevelUp(newPhase);
        // Unlock new phase in Firebase (now with quest requirements)
        xpService.unlockNewPhase(user?.uid || '', newPhase);
      }
    }
  }, [level, maxUnlockedPhase, user?.uid]);

  const handleLevelUp = async (newLevel: number) => {
    setAnimateLevel(true);
    setOverlayMsg(`🎉 Level up! \n You reached level ${newLevel}!`);
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

  const avatarSrc = `/images/avatars/phase-${phaseIndex}.webp`;

  // Phase navigation functions
  const goToPreviousPhase = async () => {
    if (!user) return;
    
    const currentIndex = availablePhases.indexOf(phaseIndex);
    if (currentIndex > 0) {
      const newPhase = availablePhases[currentIndex - 1];
      setPhaseIndex(newPhase);
      await xpService.updateUserAvatarPhase(user.uid, newPhase);
    }
  };

  const goToNextPhase = async () => {
    if (!user) return;
    
    const currentIndex = availablePhases.indexOf(phaseIndex);
    if (currentIndex < availablePhases.length - 1) {
      const newPhase = availablePhases[currentIndex + 1];
      setPhaseIndex(newPhase);
      await xpService.updateUserAvatarPhase(user.uid, newPhase);
    }
  };




  return (
    <div className={styles.panel}>
      {overlayMsg && <LevelUpOverlay message={overlayMsg} onClose={() => setOverlayMsg(null)} />}

      {/* Video Background based on character phase */}
      {phaseIndex <= 6 && (
        <video 
          src={`/images/avatars/phase-${phaseIndex}.mp4`} 
          autoPlay 
          loop 
          muted 
          className={styles.videoBackground} 
        />
      )}

      <div className={styles.robotHeader}>
        <div className={styles.description}>
          This is <span className='glitch'>{robotName}</span> &nbsp;
          <button 
            className={styles.editNameButton}
            onClick={() => setShowRobotNameModal(true)}
            title="Edit robot name"
          >
            ✏️
          </button>
        </div>
      </div>



      <div >
        {/* Phase Navigation Arrows */}
        <div className={styles.phaseNavigation}>
          <button 
            className={`${styles.phaseArrow} ${availablePhases.indexOf(phaseIndex) === 0 ? styles.disabled : ''}`}
            onClick={goToPreviousPhase}
            disabled={availablePhases.indexOf(phaseIndex) === 0}
            title="Previous Phase"
          >
            ⬅️
          </button>
          
          <div className={styles.avatarWrapper}>
            <img
              src={avatarSrc}
              alt="Character"
              className={`${styles.avatar} ${animateLevel ? styles.avatarEvolve : ''}`}
            />
          </div>
          
          <button 
            className={`${styles.phaseArrow} ${availablePhases.indexOf(phaseIndex) === availablePhases.length - 1 ? styles.disabled : ''}`}
            onClick={goToNextPhase}
            disabled={availablePhases.indexOf(phaseIndex) === availablePhases.length - 1}
            title="Next Phase"
          >
            ➡️
          </button>
        </div>
        
        <p className={styles.status}>
          Phase:{' '}
          <span className={`glitch ${animateLevel ? styles.levelUp : ''}`} data-text={phaseIndex}>
            {phaseIndex}
          </span>{' '}
          | Level:{' '}
          <span className={`glitch ${animateLevel ? styles.levelUp : ''}`} data-text={level}>
            {level}
          </span>{' '}
          | XP:{' '}
          <span data-text={`${Math.floor(xp)}/1000`} className="glitch">
            {Math.floor(xp)}/1000
          </span>
        </p>
        
        <p className={styles.phaseInfo}>
          Available Phases: {availablePhases.join(', ')} | Max Unlocked: {maxUnlockedPhase}/6
        </p>

        {/* Phase Progress */}
        <div className={styles.phaseProgress}>
          <div className={styles.phaseProgressLabel}>Phase Progress</div>
          <div className={styles.phaseDots}>
            {[1, 2, 3, 4, 5, 6].map((phase) => (
              <div
                key={phase}
                className={`${styles.phaseDot} ${
                  availablePhases.includes(phase) ? styles.unlocked : styles.locked
                } ${phaseIndex === phase ? styles.current : ''}`}
                title={`Phase ${phase}${phaseIndex === phase ? ' (Current)' : ''}`}
              >
                {phase}
              </div>
            ))}
          </div>
        </div>

        {/* Next Phase Info */}
        {maxUnlockedPhase < 6 && (
          <div className={styles.nextPhaseInfo}>
            <div className={styles.nextPhaseLabel}>Next Phase</div>
            <div className={styles.nextPhaseValue}>
              Phase {maxUnlockedPhase + 1} - Need {1000 - Math.floor(xp)} more XP
            </div>
          </div>
        )}
        
      </div>

      <br />

      <p className={styles.description}>
        <strong style={{ color: 'var(--clr-3)' }}>Level up</strong> by <strong style={{ color: 'var(--neon-color)' }}>earning XP</strong>! <br />
        <strong style={{ color: 'var(--clr-3)' }}>Boost your creativity</strong> with <strong style={{ color: 'var(--neon-color)' }}>special items</strong> and <strong style={{ color: 'var(--neon-color)' }}>rewards</strong>!
      </p>

      {/* Robot Name Modal */}
      <RobotNameModal
        isVisible={showRobotNameModal}
        onClose={() => setShowRobotNameModal(false)}
        currentName={robotName}
        onNameUpdated={(newName) => setRobotName(newName)}
      />

    </div>
  );
};

export default CharacterPanel;
