'use client';

import React from 'react';
import { FaTimes, FaCoins, FaPlus, FaLock } from 'react-icons/fa';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';

interface PremiumRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSingle: () => void;
  onUnlockTriple: () => void;
  currentRows: number;
  maxFreeRows: number;
  userCoins: number;
  singleRowPrice: number;
  tripleRowPrice: number;
  action?: 'single' | 'triple' | null;
}

const PremiumRowModal: React.FC<PremiumRowModalProps> = ({
  isOpen,
  onClose,
  onUnlockSingle,
  onUnlockTriple,
  currentRows,
  maxFreeRows,
  userCoins,
  singleRowPrice,
  tripleRowPrice,
  action,
}) => {
  if (!isOpen) return null;

  const canAffordSingle = userCoins >= singleRowPrice;
  const canAffordTriple = userCoins >= tripleRowPrice;
  const availableRows = maxFreeRows - currentRows;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.premiumModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <FaLock className={styles.titleIcon} />
            Unlock Premium Drum Rows
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.coinBalance}>
            <FaCoins className={styles.coinIcon} />
            <span className={styles.balanceText}>Your BBC Coins: {userCoins}</span>
          </div>

          <div className={styles.unlockOptions}>
            {(!action || action === 'single') && (
              <div className={`${styles.unlockCard} ${action === 'single' ? styles.highlighted : ''}`}>
                <div className={styles.unlockHeader}>
                  <FaPlus className={styles.unlockIcon} />
                  <h3 className={styles.unlockTitle}>Single Row</h3>
                  <div className={styles.priceTag}>
                    <FaCoins className={styles.priceIcon} />
                    <span className={styles.price}>{singleRowPrice}</span>
                  </div>
                </div>
                <p className={styles.unlockDescription}>
                  Unlock 1 additional drum row for more complex beats
                </p>
                <button
                  className={`${styles.unlockButton} ${!canAffordSingle ? styles.disabled : ''}`}
                  onClick={onUnlockSingle}
                  disabled={!canAffordSingle}
                >
                  {canAffordSingle ? 'Unlock Row' : 'Insufficient Coins'}
                </button>
              </div>
            )}

            {(!action || action === 'triple') && (
              <div className={`${styles.unlockCard} ${action === 'triple' ? styles.highlighted : ''}`}>
                <div className={styles.unlockHeader}>
                  <FaPlus className={styles.unlockIcon} />
                  <h3 className={styles.unlockTitle}>Triple Pack</h3>
                  <div className={styles.priceTag}>
                    <FaCoins className={styles.priceIcon} />
                    <span className={styles.price}>{tripleRowPrice}</span>
                  </div>
                  <div className={styles.savingsBadge}>Save 40%</div>
                </div>
                <p className={styles.unlockDescription}>
                  Unlock 3 additional drum rows at a discounted price
                </p>
                <button
                  className={`${styles.unlockButton} ${styles.tripleButton} ${!canAffordTriple ? styles.disabled : ''}`}
                  onClick={onUnlockTriple}
                  disabled={!canAffordTriple}
                >
                  {canAffordTriple ? 'Unlock 3 Rows' : 'Insufficient Coins'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <p className={styles.footerText}>
              Premium rows give you access to more complex drum patterns and professional-level compositions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumRowModal;
