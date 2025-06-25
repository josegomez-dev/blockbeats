'use client';

import React, { useEffect } from 'react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import VegasMintGame from '@/components/VegasMintGame';
import DronesShowGame from '@/components/DronesShowGame';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { NFT } from '@/types/nftTypes';

const miniGames = [
  {
    title: '🚁 Drones Show',
    description: 'Control a swarm of drones to draw shapes and messages in the air!',
    image: '/games/_1.png',
    key: 'drones',
    disabled: false, 
  },
  {
    title: '🎰 Mint Machine',
    description: 'Spin the reels and mint your exclusive NFT surprise!',
    image: '/games/_2.png',
    key: 'vegas',
    disabled: true,
  }
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
      <div className={'container'}>
        <h1 className={`title glitch`}>🚀 BlockBeats MiniGames Hub</h1>
        <p className={'subtitle'}>
          Welcome to the future of music & entertainment. Explore our interactive mini experiences below:
        </p>

        <div className={'grid'}>
          {miniGames.map((game, index) => (
            <div
              key={index}
              className={'card'}
              onClick={() => game.disabled ? null : handleCardClick(game.key)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={game.image}
                alt={game.title}
                className={'image'}
                style={{ height: 'auto', opacity: game.disabled ? 0.5 : 1, filter: game.disabled ? 'grayscale(100%)' : 'none' }}
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
          <div className={'fullscreen'}>
            <div className={'placeholder'}>
              <h2>🚁 Drones Show - Coming Soon</h2>
              <button onClick={() => setShowDronesGame(false)}>Exit</button>
            </div>
            {/* <DronesGame onClose={() => setShowDronesGame(false)} /> */}
          </div>
        )}

        {/* {showVegasGame && (
          <VegasMintGame
            onClose={() => setShowVegasGame(false)}
            nfts={nfts.map(nft => ({
              id: nft.id,
              title: nft.songName || 'Untitled',
              author: nft.createdBy || 'Unknown',
              colorMap: nft.colorMap ?? [],
              songName: nft.songName || 'Untitled',
              notesPlayed: nft.notesPlayed ?? [],
              frequencyRange: (nft as any).frequencyRange ?? [0, 0],
              color: (nft as any).color ?? '#FFFFFF',
              createdBy: nft.createdBy || 'Unknown',
              tempo: (nft as any).tempo ?? 120,
              createdAt: (nft as any).createdAt ?? new Date().toISOString(),
            }))}
          />
        )} */}
        
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
  
        <>
        
          {showSmartLightGame && (
            <div className={'fullscreen'}>
              <div className={'placeholder'}>
                <h2>🌆 Smart Light City - Coming Soon</h2>
                <button onClick={() => setShowSmartLightGame(false)}>Exit</button>
              </div>
              {/* <SmartLightGame onClose={() => setShowSmartLightGame(false)} /> */}
            </div>
          )}
          {showHoloGame && (
            <div className={'fullscreen'}>
              <div className={'placeholder'}>
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

      {/* <Footer /> */}
    </>
  );
};

export default MiniGamesScreen;
