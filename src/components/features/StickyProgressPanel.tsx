'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { xpService } from '../../utils/xpService';
import styles from './StickyProgressPanel.module.css';

interface StickyProgressPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

const StickyProgressPanel: React.FC<StickyProgressPanelProps> = ({ isVisible, onToggle }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isVisible) {
      loadUserStats();
    }
  }, [user, isVisible]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const xpData = await xpService.loadUserXPData(user.uid);
      const avatarData = await xpService.getUserAvatarData(user.uid);
      
      setUserStats({
        xp: xpData.xp,
        level: xpData.level,
        currentPhase: avatarData.currentPhase,
        maxUnlockedPhase: avatarData.maxUnlockedPhase,
        availablePhases: avatarData.availablePhases,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <button className={styles.toggleButton} onClick={onToggle}>
        <span className={styles.toggleIcon}>📊</span>
        {/* <span className={styles.toggleText}>Progress</span> */}
      </button>
    );
  }

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>📊 Progress Overview</h3>
          <button className={styles.closeButton} onClick={onToggle}>✕</button>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>📊 Progress Overview</h3>
        <button className={styles.closeButton} onClick={onToggle}>✕</button>
      </div>

      <div className={styles.content}>
        {/* Avatar Phase */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>🎭</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Avatar Phase</span>
            <span className={styles.statValue}>Phase {userStats?.currentPhase || 1}</span>
          </div>
        </div>

        {/* Level */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Level</span>
            <span className={styles.statValue}>{userStats?.level || 1}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className={styles.statItem}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>XP Progress</span>
            <span className={styles.statValue}>{Math.floor(userStats?.xp || 0)}%</span>
          </div>
        </div>

        {/* Phase Progress */}
        <div className={styles.phaseProgress}>
          <div className={styles.phaseProgressLabel}>Phase Progress</div>
          <div className={styles.phaseDots}>
            {[1, 2, 3, 4, 5, 6].map((phase) => (
              <div
                key={phase}
                className={`${styles.phaseDot} ${
                  userStats?.availablePhases?.includes(phase) ? styles.unlocked : styles.locked
                } ${userStats?.currentPhase === phase ? styles.current : ''}`}
                title={`Phase ${phase}${userStats?.currentPhase === phase ? ' (Current)' : ''}`}
              >
                {phase}
              </div>
            ))}
          </div>
        </div>

        {/* Next Phase Info */}
        {userStats?.maxUnlockedPhase < 6 && (
          <div className={styles.nextPhaseInfo}>
            <div className={styles.nextPhaseLabel}>Next Phase</div>
            <div className={styles.nextPhaseValue}>
              Phase {userStats.maxUnlockedPhase + 1}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyProgressPanel;
