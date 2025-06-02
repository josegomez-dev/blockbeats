'use client';

import React from 'react';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import styles from './../app/assets/styles/MainPage.module.css'; // Adjust path if needed

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  pageName: string;
}

const SignInUnautorizedModal: React.FC<SignInModalProps> = ({ open, onClose, pageName }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      center
      classNames={{ modal: styles.modal }}
      styles={{ modal: { width: '100%', background: 'transparent', padding: 50 } }}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      showCloseIcon={false}
      animationDuration={0}
      closeIcon={<span className={styles.closeIcon}>×</span>}
    >
      <div className={styles.modalContent}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <h2 className={styles.modalTitle}>Please Sign In</h2>
        <br />
        <p className={styles.modalText}>
          You need to sign in to access the <strong>{pageName}</strong>. Please sign in using your wallet.
        </p>
        <br />
        <button
          className={styles.submitBtnLarge}
          onClick={() => (window.location.href = '/')}
        >
          Sign In
        </button>
      </div>
    </Modal>
  );
};

export default SignInUnautorizedModal;
