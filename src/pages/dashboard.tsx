"use client";
import React from "react";
import MusicDrawingPage from "@/components/MusicDrawingMachine";
import CharacterPanel from "@/components/CharacterPanel";
import Web3StatsPanel from "@/components/Web3StatsPanel";
import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from "@/components/Footer";
import { RxAvatar } from "react-icons/rx";
// import { LuKeyboardMusic } from "react-icons/lu";
import { SiWeb3Dotjs } from "react-icons/si";
import { FaMusic } from "react-icons/fa";
import Modal from 'react-responsive-modal';
import { useAuth } from "@/context/AuthContext";

const DashboardLayout = () => {

  const { user } = useAuth();

  const showPanel = (panel: string) => {
    const panels = ['left', 'center', 'right'];
    panels.forEach((p) => {
      const panelElement = document.getElementById(`core-${p}-panel`);
      if (panelElement) {
        panelElement.style.display = p === panel ? 'block' : 'none';
      }
    });
  };

  if (!user) {
    return (
      <Modal
        open={true}
        onClose={() => {}}
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
          <h2 className={styles.modalTitle}>Please Sign In</h2>
          <br />
          <p className={styles.modalText}>
            You need to sign in to access the dashboard. Please sign in using your wallet.
          </p>
          <br />
          <button className={styles.submitBtnLarge} onClick={() => window.location.href = '/'}>
            Sign In
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <div className={styles.buttonsContainer}>
        <button onClick={() => showPanel('left')} className={styles.button}>
          <RxAvatar />
        </button>
        <button onClick={() => showPanel('center')} className={styles.button}>
          <FaMusic />
        </button>
        <button onClick={() => showPanel('right')} className={styles.button}>
          <SiWeb3Dotjs />
        </button>
      </div>

      <div className={styles.dashboardContainer}>
        <div className={styles.desktopGrid}>
          <div id="core-left-panel" className={styles.leftPanel}>
            <CharacterPanel />
          </div>
          <div id="core-center-panel" className={styles.centerPanel}>
            <>
              <MusicDrawingPage />
            </>
          </div>
          <div id="core-right-panel" className={styles.rightPanel}>
            <Web3StatsPanel />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default DashboardLayout;
