"use client";
import React, { useEffect } from "react";
import MusicDrawingPage from "@/components/MusicDrawingMachine";
import CharacterPanel from "@/components/CharacterPanel";
import Web3StatsPanel from "@/components/Web3StatsPanel";
import styles from "@/app/assets/styles/MainPage.module.css";
import { RxAvatar } from "react-icons/rx";
import { SiWeb3Dotjs } from "react-icons/si";
import { FaMusic } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import SignInUnautorizedModal from "@/components/SignInUnautorizedModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { TopCollections } from "@/types/topCollections";

const DashboardLayout = () => {
  const [nfts, setNFTs] = React.useState<any[]>([]);
  const [topCollections, setTopCollections] = React.useState<TopCollections[]>([]);
  const { user, authenticated } = useAuth();

  // Always call hooks unconditionally
  useEffect(() => {
    if (user && authenticated) {
      fetchNFTs();
      fetchTopCollections();
    }
  }, [user, authenticated]);

  const fetchNFTs = async () => {
    const querySnapshot = await getDocs(collection(db, "signatures"));
    const nfts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (user) {
      const userNFTs = nfts.filter((item: any) => item.createdBy === user.uid);
      setNFTs(userNFTs);
      console.log("NFTs fetched:", nfts);
    }
  };

  const fetchTopCollections = async () => {
    const querySnapshot = await getDocs(collection(db, "topCollections"));
    const collections = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTopCollections(collections as TopCollections[]);
  };

  const showPanel = (panel: string) => {
    const panels = ['left', 'center', 'right'];
    panels.forEach((p) => {
      const panelElement = document.getElementById(`core-${p}-panel`);
      if (panelElement) {
        panelElement.style.display = p === panel ? 'block' : 'none';
      }
    });
  };

  // Return fallback **after** all hooks have been used
  if (!user || !authenticated) {
    return (
      <SignInUnautorizedModal 
        open={true}
        onClose={() => {}}
        pageName="Dashboard"
      />
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
            <MusicDrawingPage nfts={nfts} topCollections={topCollections} />
          </div>
          <div id="core-right-panel" className={styles.rightPanel}>
            <Web3StatsPanel />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
