'use client';

import React from 'react';
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import styles from '../../app/assets/styles/layouts/MainPage.module.css'; // Adjust path if needed

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
      styles={{ modal: { width: '100%', height: 'auto', background: 'black', padding: 50, borderRadius: '12px' } }}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      showCloseIcon={false}
      animationDuration={0}
      closeIcon={<span className={styles.closeIcon}>×</span>}
    >
      <div className={styles.modalContent}>
        <h2 className={`${styles.modalTitle} box glitch`}> Unauthorized Access</h2>
        <br />
        <p className={styles.modalText}>
          You need to <strong className="text-neon">sign in</strong> to access the <strong className="text-clr-3">{pageName}</strong>. <br /> Please sign in using your <strong className="text-neon">email</strong> or <strong className="text-neon"> wallet</strong>.
        </p>
        <br />
        <button
          className={styles.submitBtnLarge}
          onClick={() => (window.location.href = '/auth/login')}
        >
          Sign In
        </button>
      </div>
    </Modal>
  );
};

export default SignInUnautorizedModal;
