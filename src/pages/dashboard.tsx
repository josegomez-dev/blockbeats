"use client";
import React from "react";
import MusicDrawingPage from "@/components/MusicDrawingMachine";
import CharacterPanel from "@/components/CharacterPanel";
import Web3StatsPanel from "@/components/Web3StatsPanel";
import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from "@/components/Footer";

const DashboardLayout = () => {

  return (
    <>
      <div className={styles.dashboardContainer}>
        <div className={styles.desktopGrid}>
          <div className={styles.leftPanel}><CharacterPanel /></div>
          <div className={styles.centerPanel}>
            <MusicDrawingPage />
          </div>
          <div className={styles.rightPanel}><Web3StatsPanel /></div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardLayout;
