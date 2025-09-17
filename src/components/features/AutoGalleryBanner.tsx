import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import { NFT } from '@/types/nftTypes';
import PixelPreview from '@/components/machines/PixelPreview';
import { playMelody, playDrumLoop, ctx } from "@/utils/helpers/drumHelper";
import { notes } from "@/utils/constants/musicDrawingMachine";
import styles from '@/app/assets/styles/pages/LandingPage.module.css';

const AutoGalleryBanner: React.FC = () => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [stopMelodyRef, setStopMelodyRef] = useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = useState<(() => void) | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // Fetch the 10 most recent NFTs for the banner
        const q = query(
          collection(db, "signatures"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedNFTs = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as NFT),
          id: doc.id
        })) as NFT[];
        
        setNFTs(fetchedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs for banner:', error);
        setNFTs([]);
      }
    };

    fetchNFTs();
  }, []);

  // Auto-cycling effect
  useEffect(() => {
    if (nfts.length > 1 && isAutoPlaying && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % nfts.length);
      }, 4000); // Change every 4 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nfts.length, isAutoPlaying, isHovered]);

  const handlePlayNFT = (nft: NFT) => {
    console.log('🎵 Playing NFT:', nft.songName, 'Current playing:', isPlaying);
    
    // Initialize audio context if needed
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        console.log('🔊 Audio context resumed');
      }).catch(err => {
        console.error('❌ Failed to resume audio context:', err);
      });
    }
    
    // Stop any current playback first
    stopMelodyRef?.();
    stopDrumRef?.();
    setStopMelodyRef(null);
    setStopDrumRef(null);
    setIsPlaying(false);

    // If clicking the same NFT that's already playing, just stop
    if (isPlaying && nfts[currentIndex]?.id === nft.id) {
      console.log('🛑 Stopping current playback');
      return;
    }

    // Start new playback
    setIsPlaying(true);
    console.log('▶️ Starting new playback');

    try {
      const melody = (nft.colorMap ?? []).map(({ noteIndex, time }) => ({ noteIndex, time }));
      const tempo = nft.tempo || 300;
      
      console.log('🎼 Melody data:', melody.length, 'notes, tempo:', tempo);

      if (melody.length === 0) {
        console.log('⚠️ No melody data, playing simple tone');
        // Play a simple tone if no melody data
        const stopDrum = playDrumLoop(tempo, () => {
          console.log('🥁 Drum loop finished');
        });
        setStopDrumRef(() => stopDrum);
        return;
      }

      // Play drum loop
      const stopDrum = playDrumLoop(tempo, () => {
        console.log('🥁 Drum loop finished');
      });
      setStopDrumRef(() => stopDrum);

      // Play melody
      const stopMelody = playMelody(
        melody,
        tempo,
        notes.map(n => n[1]),
        () => {
          console.log('🎵 Melody finished');
          stopDrum?.();
          setIsPlaying(false);
          setStopDrumRef(null);
          setStopMelodyRef(null);
        }
      );

      setStopMelodyRef(() => stopMelody);
    } catch (error) {
      console.error('❌ Error playing NFT:', error);
      setIsPlaying(false);
      setStopDrumRef(null);
      setStopMelodyRef(null);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + nfts.length) % nfts.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % nfts.length);
  };

  const handleToggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return 'Anonymous';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (nfts.length === 0) {
    return null; // Don't show banner if no NFTs
  }

  const currentNFT = nfts[currentIndex];

  return (
    <div 
      className={styles.autoGalleryBanner}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Animation */}
      <div className={styles.bannerBackground}>
        <div className={styles.bannerParticles}></div>
        <div className={styles.bannerGrid}></div>
      </div>

      {/* Main Content */}
      <div className={styles.bannerContent}>
        {/* Left Side - NFT Preview */}
        <div className={styles.bannerNFTPreview}>
          <div 
            className={styles.bannerNFTContainer}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePlayNFT(currentNFT);
            }}
            style={{ cursor: 'pointer' }}
          >
            <PixelPreview
              colorMap={currentNFT.colorMap || []}
              size={80}
              backgroundColor={currentNFT.color || '#000'}
            />
            <div className={styles.bannerPlayOverlay}>
              <button
                className={`${styles.bannerPlayButton} ${isPlaying ? styles.playing : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔘 Button clicked!');
                  handlePlayNFT(currentNFT);
                }}
                style={{
                  transform: 'scale(1)',
                  transition: 'transform 0.1s ease'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>
        </div>

        {/* Center - NFT Info */}
        <div className={styles.bannerInfo}>
          <div className={styles.bannerTitle}>
            {currentNFT.songName || 'Untitled Song'}
          </div>
          <div className={styles.bannerArtist}>
            by {formatWalletAddress(currentNFT.createdBy)}
          </div>
          <div className={styles.bannerMeta}>
            <span className={styles.bannerTempo}>{currentNFT.tempo || 120} BPM</span>
            <span className={styles.bannerProgress}>
              {currentIndex + 1} / {nfts.length}
            </span>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className={styles.bannerControls}>
          <button 
            className={styles.bannerControlButton}
            onClick={handlePrevious}
            disabled={nfts.length <= 1}
          >
            ⬅️
          </button>
          
          {/* <button 
            className={`${styles.bannerControlButton} ${isAutoPlaying ? styles.active : ''}`}
            onClick={handleToggleAutoPlay}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button> */}
          
          <button 
            className={styles.bannerControlButton}
            onClick={handleNext}
            disabled={nfts.length <= 1}
          >
            ➡️
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.bannerProgressBar}>
        <div 
          className={styles.bannerProgressFill}
          style={{ 
            width: `${((currentIndex + 1) / nfts.length) * 100}%`,
            animation: isAutoPlaying && !isHovered ? 'progressFill 4s linear infinite' : 'none'
          }}
        ></div>
      </div>

      {/* Quick Access Button */}
      <button 
        className={styles.bannerQuickAccess}
        onClick={() => window.location.href = '/marketplace/marketplace'}
      >
        🛒 View All
      </button>
    </div>
  );
};

export default AutoGalleryBanner;
