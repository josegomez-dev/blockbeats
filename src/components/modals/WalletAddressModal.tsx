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
      <div className="modal-content" style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 className={styles.modalTitle} style={{ 
            background: 'linear-gradient(45deg, #00FFFF, #FF00FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '24px',
            marginBottom: '10px'
          }}>
            🔗 Connect Your Wallet
          </h2>
          <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '20px' }}>
            Enter your Starknet wallet address to connect
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError('');
              }}
              placeholder="0x1234...abcd"
              className={styles.emailInput}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '1px'
              }}
              disabled={loading}
            />
            {error && (
              <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '5px' }}>
                {error}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.submitBtn}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #666',
                color: '#666',
                flex: 1
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              style={{
                background: 'linear-gradient(45deg, #00FFFF, #FF00FF)',
                border: 'none',
                flex: 1,
                position: 'relative',
                overflow: 'hidden'
              }}
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

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(0, 255, 255, 0.3)'
        }}>
          <p style={{ fontSize: '12px', color: '#00FFFF', margin: 0 }}>
            💡 <strong>Supported Wallets:</strong> Argent X, Braavos
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WalletAddressModal;
