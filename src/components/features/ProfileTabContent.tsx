'use client';

import React from 'react';
import Image from 'next/image';
import PixelPreview from '../machines/PixelPreview';
import styles from './ProfileTabContent.module.css';

interface UserStats {
  xp: number;
  level: number;
  currentPhase: number;
  maxUnlockedPhase: number;
  availablePhases: number[];
  totalCreations: number;
  drawingMachineCreations: number;
  drumMachineCreations: number;
  totalXP: number;
}

interface UserCreation {
  id: string;
  name: string;
  type: 'drawing' | 'drums';
  createdAt: Date;
  data: any;
  description?: string;
  tempo?: number;
  machineType?: string;
  isOldFormat?: boolean;
  colorMap?: any[];
  drawingMachine?: any;
  drumMachine?: any;
}

interface ProfileTabContentProps {
  tabType: 'account' | 'progress' | 'creations';
  user: any;
  userStats: UserStats | null;
  userCreations: UserCreation[];
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  tabType,
  user,
  userStats,
  userCreations
}) => {
  const memberSince = user?.createdAt ? 
    (() => {
      try {
        const date = new Date(user.createdAt);
        if (isNaN(date.getTime())) {
          return 'N/A';
        }
        // Format as "Month Day, Year" (e.g., "January 15, 2024")
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return 'N/A';
      }
    })() : 'N/A';

  switch (tabType) {
    case 'account':
      return (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h3>👤 Account Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{user?.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Member Since:</span>
                <span className={styles.infoValue}>{memberSince}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Wallet:</span>
                <span className={styles.infoValue}>
                  {user?.walletStored ? `${user.walletStored.slice(0, 6)}...${user.walletStored.slice(-4)}` : 'N/A'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={styles.infoValue}>{user?.status || 'Active'}</span>
              </div>
            </div>
          </div>

        </div>
      );

    case 'progress':
      return (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h3>📈 Progress Overview</h3>
            <div className={styles.progressGrid}>
              <div className={styles.progressCard}>
                <h4>Avatar Evolution</h4>
                <div className={styles.phaseProgress}>
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
                <p>Unlocked {userStats?.maxUnlockedPhase || 1} of 6 phases</p>
              </div>

              <div className={styles.progressCard}>
                <h4>XP Progress</h4>
                <div className={styles.xpBar}>
                  <div 
                    className={styles.xpFill}
                    style={{ width: `${userStats?.xp || 0}%` }}
                  ></div>
                </div>
                <p>{Math.floor(userStats?.xp || 0)}% to next level</p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>📊 Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⭐</div>
                <div className={styles.statContent}>
                  <h4>Total XP</h4>
                  <p className={styles.statValue}>{userStats?.totalXP || 0}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏆</div>
                <div className={styles.statContent}>
                  <h4>Max Phase</h4>
                  <p className={styles.statValue}>{userStats?.maxUnlockedPhase || 1}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statContent}>
                  <h4>BBC Points</h4>
                  <p className={styles.statValue}>{user?.bbcPoints || 0}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎨</div>
                <div className={styles.statContent}>
                  <h4>Total Creations</h4>
                  <p className={styles.statValue}>{userStats?.totalCreations || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'creations':
      return (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <div className={styles.comingSoonContainer}>
              <div className={styles.comingSoonBadge}>
                <span className={styles.comingSoonIcon}>🚧</span>
                <span className={styles.comingSoonText}>Coming Soon</span>
              </div>
              <h3>🎵 Your Musical Creations</h3>
              <div className={styles.comingSoonContent}>
                <div className={styles.comingSoonIcon}>🎼</div>
                <h4>Creations Gallery Coming Soon!</h4>
                <p>We're working on bringing your musical NFT collection to your profile. In the meantime, you can view and manage your creations in the <strong>Marketplace</strong>.</p>
                <div className={styles.comingSoonFeatures}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎨</span>
                    <span>Pixel Art Previews</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎵</span>
                    <span>Audio Playback</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>📊</span>
                    <span>Creation Statistics</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>✏️</span>
                    <span>Edit & Manage</span>
                  </div>
                </div>
                <div className={styles.comingSoonAction}>
                  <p>Visit the <strong>Marketplace</strong> to see your musical NFTs!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );


    default:
      return <div>Invalid tab type</div>;
  }
};

export default ProfileTabContent;
