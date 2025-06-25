"use client";
import React, { useEffect, useState } from "react";
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
import VegasMintGame from "@/components/VegasMintGame";
import Image from "next/image";
import NeonSlider from "@/components/NeonSlider";

const DashboardLayout = () => {
  const [nfts, setNFTs] = React.useState<any[]>([]);
  const [topCollections, setTopCollections] = React.useState<TopCollections[]>([]);

  const [totalNFTCreations, setTotalNFTCreations] = React.useState<number>(0);
  const [totalTopCollections, setTotalTopCollections] = React.useState<number>(0);

  const [showVegasGame, setShowVegasGame] = React.useState(false);
  const [showRewards, setShowRewards] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const { user, authenticated } = useAuth();

  useEffect(() => {
    if (!showRewards) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowRewards(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showRewards]);

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
      setTotalNFTCreations(userNFTs.length);
    }
  };

  const fetchTopCollections = async () => {
    const querySnapshot = await getDocs(collection(db, "topCollections"));
    const collections = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (user) {
      const userCollections = collections.filter((item: any) => item.createdBy === user.uid);
      setTopCollections(userCollections as TopCollections[]);
      setTotalTopCollections(userCollections.length);
    }
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
// could you help me to add a counter that disapear in 1 min 
        
  return (
    <>
      {showRewards && (
        <div style={{ textAlign: 'center', width: '100%', margin: '10px auto' }}>
          <br />
          <h1 className={`title ${styles.glitch}`}>BlockBeats </h1>
          <button style={{ margin: '0 auto', background: 'white' }} className={styles.submitBtn} onClick={() => setShowVegasGame(true)}>
            ⏳ Claim <span style={{ color: 'gold' }}>100 <span className="glitch">BBC</span></span>&nbsp;
            <span style={{ color: 'red' }}>{secondsLeft}s left</span>
          </button>
          <br />
          <br />
          <Image
            src="/avatar/phase-6.webp"
            alt="Coin"
            width={300}
            height={300}
            style={{ display: 'block', margin: '0 auto', marginTop: '10px' }}
          />
          <br />
          <p style={{ fontSize: '1.2rem', position: 'relative', top: '-80px', marginBottom: '-50px' }}>
            <b style={{ color: 'red' }}>Note: You can only claim rewards once every day.</b><br />  
            <br />
            <b style={{ color: 'white' }}>Tip:</b> Complete quests to earn more rewards!
          </p>

          <hr />
          <div style={{ marginTop: '-50px' }}>
            <NeonSlider
              slides={nfts.map(nft => ({
                id: nft.id,
                songName: nft.songName || '',
                colorMap: nft.colorMap || [],
                notesPlayed: (nft.notesPlayed || []).join(','),
                createdBy: nft.createdBy || '',
                createdAt: new Date().toISOString(), // or use nft.createdAt if available
                tempo: nft.tempo, // default tempo or use nft.tempo if available
                color: nft.color || '#000000', // default background color if not present
              }))}
            />
          </div>
        </div>
      )}

      {!showRewards && (
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
            <br />
            <div className={styles.desktopGrid}>
              <div id="core-left-panel" className={styles.leftPanel}>
                <CharacterPanel />
              </div>
              <div id="core-center-panel" className={styles.centerPanel}>
                <MusicDrawingPage nfts={nfts} topCollections={topCollections} />
              </div>
              <div id="core-right-panel" className={styles.rightPanel}>
                <Web3StatsPanel totalNFTCreations={totalNFTCreations} totalTopCollections={totalTopCollections} />
              </div>
            </div>
            <br />
          </div>
        </>  
      )}

       {showVegasGame && (
          <VegasMintGame
            onClose={() => setShowVegasGame(false)}
            nfts={nfts.map(nft => ({
              id: nft.id,
              title: nft.songName || 'Untitled',
              author: nft.createdBy || 'Unknown',
              colorMap: Array.isArray(nft.colorMap)
                ? Object.fromEntries(
                    (nft.colorMap as any[]).map((entry, idx) =>
                      typeof entry === 'object' && entry !== null
                        ? [entry.key ?? String(idx), entry.value ?? '']
                        : [String(idx), String(entry)]
                    )
                  )
                : (nft.colorMap as unknown as Record<string, string>) ?? {},
              songName: nft.songName || 'Untitled',
              notesPlayed: nft.notesPlayed ?? [],
              frequencyRange: (nft as any).frequencyRange ?? [0, 0],
              color: (nft as any).color ?? '#FFFFFF',
              createdBy: nft.createdBy || 'Unknown',
              tempo: (nft as any).tempo ?? 120,
              createdAt: (nft as any).createdAt ?? new Date().toISOString(),
            }))}
          />
        )}
    </>
  );
};

export default DashboardLayout;
