'use client';

import React, { useEffect } from 'react';
import styles from './../app/assets/styles/MiniGames.module.css';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import VegasMintGame from '@/components/VegasMintGame';
import DronesShowGame from '@/components/DronesShowGame';
import SmartLightGame from '@/components/SmartLightGame';
import HolographicArenaGame from '@/components/HolographicArenaGame';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
// import DronesGame from '@/components/DronesGame';
// import SmartLightGame from '@/components/SmartLightGame';
// import HolographicGame from '@/components/HolographicGame';

type NFT = {
  id: string;
  createdBy?: string;
  songName?: string;
  colorMap?: any[];
  notesPlayed?: any[];
  img?: string;
  // add other properties as needed
};

const miniGames = [
  {
    title: '🚁 Drones Show',
    description: 'Control a swarm of drones to draw shapes and messages in the air!',
    image: '/games/_1.png',
    key: 'drones',
  },
  {
    title: '🎰 Mint Machine',
    description: 'Spin the reels and mint your exclusive NFT surprise!',
    image: '/games/_2.png',
    key: 'vegas',
  },
  {
    title: '🌆 Smart Light City',
    description: 'Light up buildings and streets in rhythmic patterns.',
    image: '/games/_3.png',
    key: 'smart',
  },
  {
    title: '🪐 Holographic Arena',
    description: 'Enter a 3D hologram space and experience immersive music games!',
    image: '/games/_4.png',
    key: 'holo',
  },
];

const MiniGamesScreen = () => {
  const [nfts, setNFTs] = React.useState<NFT[]>([]);
  
  const [showDronesGame, setShowDronesGame] = React.useState(false);
  const [showVegasGame, setShowVegasGame] = React.useState(false);
  const [showSmartLightGame, setShowSmartLightGame] = React.useState(false);
  const [showHoloGame, setShowHoloGame] = React.useState(false);

  const handleCardClick = (key: string) => {
    switch (key) {
      case 'drones':
        setShowDronesGame(true);
        break;
      case 'vegas':
        setShowVegasGame(true);
        break;
      case 'smart':
        setShowSmartLightGame(true);
        break;
      case 'holo':
        setShowHoloGame(true);
        break;
    }
  };

   useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setNFTs(nfts);
    };
    fetchNFTs();
  }, []);


  return (
    <>
      <div className={styles.container}>
        <h1 className={`${styles.title} glitch`}>🚀 BlockBeats MiniGames Hub</h1>
        <p className={styles.subtitle}>
          Welcome to the future of music & entertainment. Explore our interactive mini experiences below:
        </p>

        <div className={styles.grid}>
          {miniGames.map((game, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => handleCardClick(game.key)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={game.image}
                alt={game.title}
                className={styles.image}
                style={{ height: 'auto' }}
              />
              {/* You can re-enable this block for text under each card */}
              {/* <div className={styles.content}>
                <h3 className={styles.cardTitle}>{game.title}</h3>
                <p className={styles.cardDescription}>{game.description}</p>
              </div> */}
            </div>
          ))}
        </div>

        {/* Game full-screen overlays */}
        {showDronesGame && (
          <div className={styles.fullscreen}>
            <div className={styles.placeholder}>
              <h2>🚁 Drones Show - Coming Soon</h2>
              <button onClick={() => setShowDronesGame(false)}>Exit</button>
            </div>
            {/* <DronesGame onClose={() => setShowDronesGame(false)} /> */}
          </div>
        )}

        {showVegasGame && (
          <VegasMintGame
            onClose={() => setShowVegasGame(false)}
            nfts={nfts.map(nft => ({
              id: nft.id,
              title: nft.songName || 'Untitled',
              author: nft.createdBy || 'Unknown',
              image: '/nft1.webp',
              colorMap: nft.colorMap ?? [],
            }))}
          />
        )}
        {showDronesGame && (
          <DronesShowGame
            onClose={() => setShowDronesGame(false)}
            artworks={nfts.map(nft => ({
              ...nft,
              title: nft.songName || 'Untitled',
              author: nft.createdBy || 'Unknown',
              colorMap: nft.colorMap ?? [], // Ensure colorMap is always an array
            }))}
          />
        )}
        {showSmartLightGame && (
          <SmartLightGame
            onClose={() => setShowSmartLightGame(false)}
            nfts={nfts.map(nft => ({
              title: nft.songName || 'Untitled',
              author: nft.createdBy || 'Unknown',
              colorMap: nft.colorMap ?? [],
            }))}
          />
        )}
        <>
          {showHoloGame && (
            <HolographicArenaGame
              onClose={() => setShowHoloGame(false)}
              nft={nfts.map(nft => ({
                title: nft.songName || 'Untitled',
                author: nft.createdBy || 'Unknown',
                colorMap: nft.colorMap ?? [],
              }))}
            />
          )}
        
          {showSmartLightGame && (
            <div className={styles.fullscreen}>
              <div className={styles.placeholder}>
                <h2>🌆 Smart Light City - Coming Soon</h2>
                <button onClick={() => setShowSmartLightGame(false)}>Exit</button>
              </div>
              {/* <SmartLightGame onClose={() => setShowSmartLightGame(false)} /> */}
            </div>
          )}
          {showHoloGame && (
            <div className={styles.fullscreen}>
              <div className={styles.placeholder}>
                <h2>🪐 Holographic Arena - Coming Soon</h2>
                <button onClick={() => setShowHoloGame(false)}>Exit</button>
              </div>
              {/* <HolographicGame onClose={() => setShowHoloGame(false)} /> */}
            </div>
          )}
        </>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Image
            src={'/starknet-logo.svg'}
            alt={'metamask'}
            width={200}
            height={50}
            style={{ filter: 'invert(1) drop-shadow(0 0 0.3rem #ffffff70)' }}
          />
          &nbsp;&nbsp;&nbsp;
          <Link href={'https://josegomez-dev.github.io/MusicalPath/'} target={'_blank'}>
            <Image
              src={'/musicalpathlogo.webp'}
              alt={'musicalpath'}
              width={100}
              height={70}
              style={{ marginBottom: '-5px' }}
            />
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MiniGamesScreen;
