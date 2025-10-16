import React, { useEffect, useState, useRef } from "react";
import CharacterPanel from '../../components/features/CharacterPanel';
import Web3StatsPanel from '../../components/features/Web3StatsPanel';
import DailyRewardModal from '../../components/modals/DailyRewardModal';
import VegasMintGame from '../../components/features/VegasMintGame';
import SignInUnautorizedModal from '../../components/modals/SignInUnautorizedModal';

import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import { SiWeb3Dotjs } from "react-icons/si";
import { FaMusic, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
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
  const [showRewards, setShowRewards] = useState(true);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { user, authenticated } = useAuth();
  const router = useRouter();

  // ────────────────────────────────────────────────
  // 🎵 Audio Player Effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Auto-play when component mounts
    if (audioRef.current && user && authenticated) {
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          console.log('Auto-play prevented by browser:', error);
          setIsPlaying(false);
        }
      };
      playAudio();
    }
  }, [user, authenticated]);

  // ────────────────────────────────────────────────
  // 📦 Initial Rewards Check
  // useEffect(() => {
  //   const lastClaim = localStorage.getItem("lastRewardClaimDate");
  //   const today = new Date().toISOString().split("T")[0];
  //   if (lastClaim !== today) {
  //     setShowRewards(true);
  //   }
  // }, []);

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

  // 🎵 Audio Control Functions
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
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

        {/* 🎵 Audio Player */}
        <audio
          ref={audioRef}
          src="/sounds/app/dashboard.mp3"
          loop
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />

        {/* 📱 Mobile App-style Buttons */}
        <div className={styles.buttonsContainer}>
          <button onClick={() => showPanel('left')} className={styles.button}><RxAvatar /></button>
          <button onClick={() => showPanel('center')} className={styles.button}><FaMusic /></button>
          <button onClick={() => showPanel('right')} className={styles.button}><SiWeb3Dotjs /></button>
        </div>

        {/* 🎨 Enhanced Dashboard Header */}
        <div className="dashboard-header-enhanced">
          <div className="header-background-effects">
            <div className="floating-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
          </div>
          
          <div className="header-content">
            <div className="main-title-container">
              <h1 className="dashboard-main-title">
                Your Musical NFTs Collection & Web3 Stats
              </h1>
            </div>
            
            <div className="subtitle-container">
              <p className="dashboard-subtitle">
                🎵 Immerse yourself in your musical universe 🎵
              </p>
              <p className="dashboard-description">
                Explore your NFT collection, track character progression, monitor Web3 stats, 
                and access the creative launchpad for crafting new musical masterpieces.
              </p>
            </div>

            {/* 🎛️ Audio Controls */}
            <div className="audio-controls-panel">
              <div className="audio-controls">
                <button 
                  className="play-pause-btn"
                  onClick={togglePlayPause}
                  title={isPlaying ? "Pause Music" : "Play Music"}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                
                <div className="volume-control">
                  <button 
                    className="mute-btn"
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    title="Volume Control"
                  />
                </div>
                
                <div className="audio-status">
                  <span className="status-indicator">
                    {isPlaying ? "🎵 Playing" : "⏸️ Paused"}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                    <br />
                    <br />
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
                        <span className="coop-button-text">Co-operative <span className="text-neon-color">Live</span> Mode</span>
                        <span className="text-neon-color">Play music with friends</span>
                      </button>
                    </div>
                  </div>
                </div>

                <br />
                
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


          {/* <hr />
          <p className="dashboard-description-large">
            <span>
              <strong className="glitch">BlockBeats 3.0</strong> empowers anyone to <strong className="text-neon-color">trade music</strong> and <strong className="text-neon-color">support artists</strong> through an interactive platform <strong className="text-clr-3">that connects art and real-world experiences</strong>.
            </span>
          </p> */}
        </div>
      </div>
      
      
      <Footer />
    </>
  );
};

export default DashboardLayout;
