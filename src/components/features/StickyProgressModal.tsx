'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './StickyProgressModal.module.css';

interface StickyProgressModalProps {
  currentPhase: number;
  userLevel: number;
  isVisible: boolean;
  onClose: () => void;
}

const StickyProgressModal: React.FC<StickyProgressModalProps> = ({
  currentPhase,
  userLevel,
  isVisible,
  onClose
}) => {
  if (!isVisible || currentPhase >= 6) {
    return null;
  }

  const nextPhase = currentPhase + 1;
  const levelNeeded = nextPhase - userLevel;
  const canUnlock = userLevel >= nextPhase;
  const progressPercentage = canUnlock ? 100 : Math.round((userLevel / nextPhase) * 100);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>🚀 Next Phase Progress</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>
            {progressPercentage}% Complete
          </p>
        </div>

        <div className={styles.requirementsSection}>
          <h4>Requirements for Phase {nextPhase}:</h4>
          
          <div className={styles.requirementItem}>
            <span className={`${styles.requirementIcon} ${canUnlock ? styles.completed : ''}`}>
              {canUnlock ? '✅' : '📈'}
            </span>
            <span className={styles.requirementText}>
              Reach Level {nextPhase} 
              {canUnlock ? ' (Completed!)' : ` (Current: ${userLevel})`}
            </span>
          </div>
        </div>

        <div className={styles.rewardSection}>
          <h4>🎁 Phase {nextPhase} Rewards:</h4>
          <div className={styles.rewardsList}>
            <div className={styles.rewardItem}>
              <span className={styles.rewardIcon}>🎭</span>
              <span>New Avatar Phase</span>
            </div>
            <div className={styles.rewardItem}>
              <span className={styles.rewardIcon}>⚡</span>
              <span>Enhanced Abilities</span>
            </div>
            <div className={styles.rewardItem}>
              <span className={styles.rewardIcon}>🏆</span>
              <span>Exclusive Features</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyProgressModal;
