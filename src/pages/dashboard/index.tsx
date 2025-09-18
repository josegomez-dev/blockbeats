import React, { useEffect, useState } from "react";
import CharacterPanel from '../../components/features/CharacterPanel';
import Web3StatsPanel from '../../components/features/Web3StatsPanel';
import DailyRewardModal from '../../components/modals/DailyRewardModal';
import VegasMintGame from '../../components/features/VegasMintGame';
import SignInUnautorizedModal from '../../components/modals/SignInUnautorizedModal';

import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import { SiWeb3Dotjs } from "react-icons/si";
import { FaMusic } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from '../../context/AuthContext';
import { useRouter } from "next/router";

import styles from "@/app/assets/styles/layouts/MainPage.module.css";
import Footer from '../../components/layout/Footer';
import Head from 'next/head';

const DashboardLayout = () => {
  const [nfts, setNFTs] = useState<any[]>([]);
  const [totalNFTCreations, setTotalNFTCreations] = useState(0);
  const [totalTopCollections, setTotalTopCollections] = useState(0);

  const [showVegasGame, setShowVegasGame] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const { user, authenticated } = useAuth();
  const router = useRouter();

  // ────────────────────────────────────────────────
  // 📦 Initial Rewards Check
  useEffect(() => {
    const lastClaim = localStorage.getItem("lastRewardClaimDate");
    const today = new Date().toISOString().split("T")[0];
    if (lastClaim !== today) {
      setShowRewards(true);
    }
  }, []);

  // ────────────────────────────────────────────────
  // 📡 Fetch Data
  useEffect(() => {
    if (user && authenticated) {
      fetchNFTs();
      fetchTopCollections();
    }
  }, [user, authenticated]);

  const fetchNFTs = async () => {
    const querySnapshot = await getDocs(collection(db, "signatures"));
    const nfts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNFTs(nfts);
    if (user) {
      const userNFTs = nfts.filter((item: any) => item.createdBy === user.uid);
      setTotalNFTCreations(userNFTs.length);
    }
  };

  const fetchTopCollections = async () => {
    const querySnapshot = await getDocs(collection(db, "topCollections"));
    const collections = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (user) {
      const userCollections = collections.filter((item: any) => item.createdBy === user.uid);
      setTotalTopCollections(userCollections.length);
    }
  };

  const handleRewardClaim = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("lastRewardClaimDate", today);
    setShowVegasGame(true);
    setShowRewards(false);
  };

  const showPanel = (panel: string) => {
    const panels = ['left', 'center', 'right'];
    panels.forEach((p) => {
      const el = document.getElementById(`core-${p}-panel`);
      if (el) el.style.display = p === panel ? 'block' : 'none';
    });
  };

  if (!user || !authenticated) {
    return <SignInUnautorizedModal open={true} onClose={() => {}} pageName="Dashboard" />;
  }

  return (
    <>
      <Head>
        <title>BlockBeats Dashboard - Your Music NFT Collection & Stats</title>
        <meta name="description" content="Access your BlockBeats dashboard to view your musical NFT collection, character progression, Web3 stats, and launchpad for creating new music." />
        <meta name="keywords" content="BlockBeats dashboard, music NFT collection, character progression, Web3 stats, launchpad, musical NFTs, user dashboard" />
        <meta property="og:title" content="BlockBeats Dashboard - Your Music NFT Collection & Stats" />
        <meta property="og:description" content="Access your BlockBeats dashboard to view your musical NFT collection, character progression, Web3 stats, and launchpad for creating new music." />
        <meta property="og:image" content="https://blockbeats-tau.vercel.app/images/logos/logo.webp" />
        <meta property="og:url" content="https://blockbeats-tau.vercel.app/dashboard" />
      </Head>
      
      <div className="dashboard-background">
        <h2><span className='glitch box'>LAUNCHPAD Musical NFTs</span></h2>

        {/* 🎁 Rewards Modal */}
        {showRewards && (
          <DailyRewardModal
            onClaim={handleRewardClaim}
            onClose={() => setShowRewards(false)}
          />
        )}

        {/* 🎰 Game */}
        {showVegasGame && (
          <VegasMintGame
            onClose={() => {
              const today = new Date().toISOString().split("T")[0];
              localStorage.setItem("lastRewardClaimDate", today);
              setShowRewards(false);
              setShowVegasGame(false);
            }}
          />
        )}

        {/* 📱 Mobile App-style Buttons */}
        <div className={styles.buttonsContainer}>
          <button onClick={() => showPanel('left')} className={styles.button}><RxAvatar /></button>
          <button onClick={() => showPanel('center')} className={styles.button}><FaMusic /></button>
          <button onClick={() => showPanel('right')} className={styles.button}><SiWeb3Dotjs /></button>
        </div>

        {/* 🖥️ Main 3-Panel Grid */}
        <div className={styles.dashboardContainer}>

          <div className={styles.desktopGrid}>
            <div id="core-left-panel" className={styles.leftPanel}><CharacterPanel /></div>
            <div id="core-center-panel" className={styles.centerPanel}>
              
              <div className="launchpad-content">

                {/* Centered Buttons */}
                <div className="launchpad-center">
                  <div className="buttons-container">
                    {/* Musical particles around the entire button area */}
                    <div className="musical-particles">
                      <div className="musical-note">♪</div>
                      <div className="musical-note">♫</div>
                      <div className="musical-note">♪</div>
                      <div className="musical-note">♫</div>
                      <div className="musical-note">♪</div>
                      <div className="musical-note">♫</div>
                      <div className="musical-note">♪</div>
                      <div className="musical-note">♫</div>
                    </div>
                    
                    {/* Start Button */}
                    <div className="start-button-container">
                      <button 
                        className="start-button"
                        onClick={() => router.push('/studio')}
                      >
                        <span className="start-button-text">START</span>
                        <span className="start-button-subtitle">Create Music</span>
                      </button>
                    </div>
                    
                    {/* Co-operative Mode Button */}
                    <div className="coop-button-container">
                      <div className="coming-soon-badge">Coming Soon</div>
                      <button 
                        className="coop-button"
                        disabled
                      >
                        <span className="coop-button-text">Co-operative Mode</span>
                        <span className="coop-button-subtitle">Play music with friends</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Text Content */}
                <div className="launchpad-bottom" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="dashboard-description">
                    <b className="glitch">BlockBeats 3.0</b> is a platform where you can <strong className="text-neon-color">create, trade, and collect</strong> <strong className="text-clr-3">musical NFTs</strong>. <br />
                    <strong className="text-clr-3">Join our community</strong> to explore unique music creations and <strong className="text-neon-color">support artists</strong>!
                  </div>
                </div>
              </div>
              
              <video 
                src="/images/launchpad/simplevideo.mp4" 
                autoPlay 
                loop 
                muted 
                className="avatar-launchpad" 
              />
            </div>
            <div id="core-right-panel" className={styles.rightPanel}>
              <Web3StatsPanel
                totalNFTCreations={totalNFTCreations}
                totalTopCollections={totalTopCollections}
              />
            </div>
          </div>

          <hr />
          <p className="dashboard-description-large">
            <span>
              <strong className="glitch">BlockBeats 3.0</strong> empowers anyone to <strong className="text-neon-color">trade music</strong> and <strong className="text-neon-color">support artists</strong> through an interactive platform <strong className="text-clr-3">that connects art and real-world experiences</strong>.
            </span>
          </p>
          <hr />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardLayout;
