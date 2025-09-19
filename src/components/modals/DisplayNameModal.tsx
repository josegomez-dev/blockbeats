import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast from 'react-hot-toast';
import styles from './DisplayNameModal.module.css';

interface DisplayNameModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentName?: string;
  onNameUpdated?: (newName: string) => void;
}

const DisplayNameModal: React.FC<DisplayNameModalProps> = ({ 
  isVisible, 
  onClose, 
  currentName = '',
  onNameUpdated
}) => {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setDisplayName(currentName);
    }
  }, [isVisible, currentName]);

  const handleSave = async () => {
    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    if (displayName.trim().length > 50) {
      toast.error('Display name too long (max 50 characters)');
      return;
    }

    try {
      setIsLoading(true);
      const userRef = doc(db, 'accounts', user.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        updatedAt: new Date()
      });
      
      // Update the AuthContext user object
      if (user) {
        setUser({
          ...user,
          displayName: displayName.trim()
        });
      }
      
      toast.success(`Display name updated to "${displayName.trim()}"!`);
      onNameUpdated?.(displayName.trim());
      onClose();
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Failed to update display name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>👤 Edit Display Name</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.inputSection}>
            <label className={styles.inputLabel}>
              Display Name
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.nameInput}
                placeholder="Enter your display name..."
                maxLength={50}
                disabled={isLoading}
              />
            </div>
            <p className={styles.characterCount}>
              {displayName.length}/50 characters
            </p>
            <p className={styles.helpText}>
              This is your public display name that appears in the navigation and profile.
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={isLoading || !displayName.trim()}
          >
            {isLoading ? 'Saving...' : 'Save Display Name'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisplayNameModal;
