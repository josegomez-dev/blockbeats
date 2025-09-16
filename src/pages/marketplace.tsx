import React, { useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PixelPreview from '@/components/machines/PixelPreview';
import { Modal } from "react-responsive-modal";
import SignInUnautorizedModal from '@/components/SignInUnautorizedModal';
import GalleryHeader from '@/components/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import { notes } from "@/utils/constants/musicDrawingMachine"; // for frequency mapping
import Head from 'next/head';


const MarketplaceScreen = () => {

  const [nfts, setNFTs] = React.useState<NFT[]>([]);

  const [showViewModal, setShowViewModal] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [stopMelodyRef, setStopMelodyRef] = React.useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = React.useState<(() => void) | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setNFTs(nfts);
    };
    fetchNFTs();
  }, []);

  const handlePlayNFT = (nft: NFT) => {
    if (isPlaying && selectedNFT?.id === nft.id) return;

    stopMelodyRef?.();
    stopDrumRef?.();

    setIsPlaying(true);

    const melody = (nft.colorMap ?? []).map(({ noteIndex, time }) => ({ noteIndex, time }));
    const tempo = nft.tempo || 300;

    const stopDrum = playDrumLoop(tempo, () => {});
    setStopDrumRef(() => stopDrum);

    const stopMelody = playMelody(
      melody,
      tempo,
      notes.map(n => n[1]),
      () => {
        stopDrum?.();
        setIsPlaying(false);
        setStopDrumRef(null);
        setStopMelodyRef(null);
      }
    );

    setStopMelodyRef(() => stopMelody);
  };


  if (!user) {
    return (
      <SignInUnautorizedModal 
        open={true}
        onClose={() => {}}
        pageName="Gallery"
      />
    );
  }

  const handleViewNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowViewModal(true);
  };
  
  const handleCloseModal = () => {
    stopMelodyRef?.();
    stopDrumRef?.();
    setStopMelodyRef(null);
    setStopDrumRef(null);
    setIsPlaying(false);
    setShowViewModal(false);
    setSelectedNFT(null);
  };

  return (
    <>
      <Head>
        <title>BlockBeats Marketplace - Trade & Discover Musical NFTs</title>
        <meta name="description" content="Explore the BlockBeats marketplace to discover, trade, and collect unique musical NFTs created by the community. Play and preview music before trading." />
        <meta name="keywords" content="BlockBeats marketplace, musical NFT trading, music NFT collection, NFT marketplace, Web3 music trading, crypto music, blockchain music" />
        <meta property="og:title" content="BlockBeats Marketplace - Trade & Discover Musical NFTs" />
        <meta property="og:description" content="Explore the BlockBeats marketplace to discover, trade, and collect unique musical NFTs created by the community. Play and preview music before trading." />
        <meta property="og:image" content="https://blockbeats-tau.vercel.app/logo.webp" />
        <meta property="og:url" content="https://blockbeats-tau.vercel.app/marketplace" />
      </Head>
      <div className="gallery-screen">
      <GalleryHeader title="Explore the Marketplace" />
        
      <div className='test-marketplace-bg'>
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className="bannerContainer" style={{ textAlign: "center", margin: "0 auto" }}>
          <h1><span className='glitch'>Marketplace</span></h1>
          <p>Trade and explore unique NFTs created by our community.</p>
          <br />
          <button onClick={() => window.location.href = '/dashboard'} className={styles.submitBtn} style={{ animation: 'none' }}>Create New NFT</button>
        </div>
      
      </div>

          {selectedNFT && (
        <Modal
          open={showViewModal}
          onClose={() => handleCloseModal()}
          center
          styles={{ modal: { backgroundColor: 'rgba(0, 0, 0, 0.8)', height: 'auto' } }}
          showCloseIcon={false}
        >
          <div className={styles.modalContent} style={{ textAlign: 'center' }}>
            <div className={styles.nftDetails}>
              <h3>{selectedNFT.songName || 'Untitled'}</h3>
              <PixelPreview
                colorMap={selectedNFT.colorMap || []}
                size={200}
                backgroundColor={selectedNFT.color || '#000'}
              />
              <br />
              <p>
                Created by: {selectedNFT.createdBy
                  ? `${selectedNFT.createdBy.slice(0, 6)}...${selectedNFT.createdBy.slice(-4)}`
                  : 'Unknown'}
              </p>
            </div>
            <button className={styles.submitBtn} onClick={handleCloseModal}>Close</button>
          </div>

        </Modal>
      )}

      <div className="gallery-screen" style={{ padding: '15px' }}>
        <div className="gallery-grid">
          {nfts.map((src, index) => (
            <div className="gallery-item" key={index} onClick={() => handleViewNFT(src)}>
              <h4
                style={{
                  whiteSpace: "nowrap",         // keeps text in one line
                  overflow: "hidden",           // hides the overflow
                  textOverflow: "ellipsis",     // adds the "..." at the end
                  fontSize: "16px",             // or whatever size you want
                  marginBottom: "10px",         // space between title and image
                  maxWidth: "150px",            // limit width to prevent overflow
                  overflowX: "auto"
                }}
              >
                {src.songName}
              </h4>
              <div className="gallery-item-overlay">
                  <PixelPreview
                    colorMap={src.colorMap || []}
                    size={100}
                    backgroundColor={src.color || '#000'}
                  />
                  <button
                    className={styles.submitBtn}
                    style={{ marginBottom: '10px', animation: 'none', backgroundColor: isPlaying && src.songName === selectedNFT?.songName ? "var(--neon-color)" : "transparent", color: isPlaying && src.songName === selectedNFT?.songName ? "white" : "var(--neon-color)" }}
                    onClick={() => handlePlayNFT(src)}
                  >
                    {isPlaying && src.songName === selectedNFT?.songName ? "Playing..." : "▶ Play NFT"}
                  </button>

              </div>
            </div>
          ))}          
        </div>
      </div>

    </div>
    </>
  );
};

export default MarketplaceScreen;
