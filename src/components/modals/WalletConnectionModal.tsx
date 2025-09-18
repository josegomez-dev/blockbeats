'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import styles from '@/app/assets/styles/layouts/MainPage.module.css';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (email: string, displayName: string) => Promise<void>;
  walletAddress: string;
  profile?: any;
  isLoading?: boolean;
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  walletAddress,
  profile,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a random name when modal opens
  useEffect(() => {
    if (isOpen && !displayName) {
      const randomNames = [
        'CryptoArtist', 'BeatMaker', 'SoundWizard', 'MusicMage', 'RhythmMaster',
        'ToneCraft', 'MelodyMaker', 'SoundSculptor', 'AudioAlchemist', 'BeatBuilder',
        'HarmonyHero', 'SoundSage', 'MusicMaven', 'TuneTitan', 'AudioAce'
      ];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      const randomNumber = Math.floor(Math.random() * 9999) + 1;
      setDisplayName(`${randomName}${randomNumber}`);
    }
  }, [isOpen, displayName]);

  // Pre-fill email if profile has a name
  useEffect(() => {
    if (isOpen && profile?.name && !email) {
      setEmail(`${profile.name.toLowerCase().replace(/\s+/g, '')}@blockbeats.com`);
    }
  }, [isOpen, profile, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !displayName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await onContinue(email, displayName);
    } catch (error) {
      console.error('Error in wallet connection:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>🎵 Complete Your BlockBeats Profile</h2>
          <button 
            className={styles.modalCloseButton} 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.walletInfo}>
            <p>🔗 Wallet Connected: <span className={styles.walletAddress}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span></p>
            {profile?.name && (
              <p>👤 Starknet Name: <span className={styles.starknetName}>{profile.name}</span></p>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
                disabled={isSubmitting}
                className={styles.modalInput}
              />
              <small className={styles.formHint}>
                This will be your public name on BlockBeats
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
                className={styles.modalInput}
              />
              <small className={styles.formHint}>
                We'll use this to send you updates and notifications
              </small>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !email || !displayName}
                className={styles.modalSubmitButton}
              >
                {isSubmitting ? 'Creating Account...' : 'Continue to Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;
