import React, { useState } from 'react';
import { Modal } from "react-responsive-modal";
import styles from "@/app/assets/styles/layouts/MainPage.module.css";

interface WalletAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: string) => void;
  loading?: boolean;
}

const WalletAddressModal: React.FC<WalletAddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (address.length < 10) {
      setError('Please enter a valid wallet address');
      return;
    }
    
    setError('');
    onSubmit(address.trim());
  };

  const handleClose = () => {
    setAddress('');
    setError('');
    onClose();
  };

  return (
    <Modal 
      classNames={{ root: styles.modal }} 
      open={isOpen} 
      onClose={handleClose}
      styles={{ 
        modal: { 
          backdropFilter: 'blur(100px)', 
          backgroundColor: 'rgba(20, 50, 100, 0.6)', 
          width: '90%',
          maxWidth: '500px',
          borderRadius: '15px',
          border: '2px solid rgba(0, 255, 255, 0.3)'
        } 
      }} 
      center
    >
      <div className="modal-content modal-content-center">
        <div className="modal-section">
          <h2 className={`${styles.modalTitle} modal-title-gradient`}>
            🔗 Connect Your Wallet
          </h2>
          <p className="modal-description">
            Enter your Starknet wallet address to connect
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-input-container">
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError('');
              }}
              placeholder="0x1234...abcd"
              className={`${styles.emailInput} modal-input`}
              style={{ textAlign: 'center', letterSpacing: '1px' }}
              disabled={loading}
            />
            {error && (
              <p className="modal-error">
                {error}
              </p>
            )}
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              onClick={handleClose}
              className={`${styles.submitBtn} modal-button-secondary`}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.submitBtn} modal-button-primary`}
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? (
                <span>Connecting...</span>
              ) : (
                <span>🚀 Connect</span>
              )}
            </button>
          </div>
        </form>

        <div className="modal-footer">
          <p className="modal-footer-text">
            💡 <strong>Supported Wallets:</strong> Argent X, Braavos
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WalletAddressModal;
