'use client';

import React from 'react';
import { Author } from '@/types/nftTypes';
import styles from './AuthorCard.module.css';

interface AuthorCardProps {
  author: Author;
  size?: 'small' | 'medium' | 'large';
  showRobotName?: boolean;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ 
  author, 
  size = 'medium',
  showRobotName = true 
}) => {
  const getRobotAvatar = (phase: number) => {
    // Return robot avatar based on phase
    const robotAvatars = [
      '/images/robots/robot-phase-1.png',
      '/images/robots/robot-phase-2.png', 
      '/images/robots/robot-phase-3.png',
      '/images/robots/robot-phase-4.png',
      '/images/robots/robot-phase-5.png',
      '/images/robots/robot-phase-6.png'
    ];
    return robotAvatars[Math.min(phase - 1, robotAvatars.length - 1)] || robotAvatars[0];
  };

  const getPhaseColor = (phase: number) => {
    const colors = [
      '#888888', // Phase 1 - Gray
      '#4CAF50', // Phase 2 - Green
      '#2196F3', // Phase 3 - Blue
      '#FF9800', // Phase 4 - Orange
      '#9C27B0', // Phase 5 - Purple
      '#F44336'  // Phase 6 - Red
    ];
    return colors[Math.min(phase - 1, colors.length - 1)] || colors[0];
  };

  return (
    <div className={`${styles.authorCard} ${styles[size]}`}>
      <div className={styles.robotAvatar}>
        <img 
          src={getRobotAvatar(author.robotPhase)} 
          alt={`${author.robotName} Phase ${author.robotPhase}`}
          className={styles.robotImage}
        />
        <div 
          className={styles.phaseBadge}
          style={{ backgroundColor: getPhaseColor(author.robotPhase) }}
        >
          {author.robotPhase}
        </div>
      </div>
      
      <div className={styles.authorInfo}>
        <div className={styles.displayName}>
          {author.displayName}
        </div>
        {showRobotName && (
          <div className={styles.robotName}>
            🤖 {author.robotName}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;
