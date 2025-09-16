import React, { useState, useEffect } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { NFT } from '@/types/nftTypes';
import PixelPreview from '@/components/machines/PixelPreview';
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import { notes } from "@/utils/constants/musicDrawingMachine";
import styles from '@/app/assets/styles/LandingPage.module.css';

const RealMusicNFTs: React.FC = () => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNFTId, setPlayingNFTId] = useState<string | null>(null);
  const [stopMelodyRef, setStopMelodyRef] = useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = useState<(() => void) | null>(null);

  useEffect(() => {
    const fetchTopNFTs = async () => {
      try {
        // Fetch the 6 most recent NFTs from the marketplace
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
        console.error('Error fetching NFTs:', error);
        // Fallback to empty array if there's an error
        setNFTs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopNFTs();
  }, []);

  const handlePlayNFT = (nft: NFT) => {
    if (isPlaying && playingNFTId === nft.id) {
      // Stop current playback
      stopMelodyRef?.();
      stopDrumRef?.();
      setIsPlaying(false);
      setPlayingNFTId(null);
      setStopMelodyRef(null);
      setStopDrumRef(null);
      return;
    }

    // Stop any current playback
    stopMelodyRef?.();
    stopDrumRef?.();

    setIsPlaying(true);
    setPlayingNFTId(nft.id);

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
        setPlayingNFTId(null);
        setStopDrumRef(null);
        setStopMelodyRef(null);
      }
    );

    setStopMelodyRef(() => stopMelody);
  };

  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return 'Anonymous';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className={styles.realMusicNFTs}>
        <div className={styles.showcaseHeader}>
          <h2>
            <span className="glitch" data-text="🎼 TOP MUSICAL NFTS">🎼 TOP MUSICAL NFTS</span>
          </h2>
          <p>Real musical NFTs created by our community</p>
        </div>
        <div className={styles.loadingGrid}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className={styles.nftCardSkeleton}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonTextSmall}></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (nfts.length === 0) {
    return (
      <section className={styles.realMusicNFTs}>
        <div className={styles.showcaseHeader}>
          <h2>
            <span className="glitch" data-text="🎼 TOP MUSICAL NFTS">🎼 TOP MUSICAL NFTS</span>
          </h2>
          <p>Real musical NFTs created by our community</p>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎵</div>
          <h3>No NFTs Yet</h3>
          <p>Be the first to create a musical NFT!</p>
          <button 
            className={styles.ctaButton}
            onClick={() => window.location.href = '/login'}
          >
            🎹 Start Creating
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.realMusicNFTs}>
      <div className={styles.showcaseHeader}>
        <h2>
          <span className="glitch" data-text="🎼 TOP MUSICAL NFTS">🎼 TOP MUSICAL NFTS</span>
        </h2>
        <p>Real musical NFTs created by our community</p>
      </div>

      <div className={styles.realNFTGrid}>
        {nfts.map((nft, index) => (
          <div
            key={nft.id}
            className={`${styles.realNFTCard} ${playingNFTId === nft.id ? styles.realNFTCardPlaying : ''}`}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {/* NFT Preview */}
            <div className={styles.realNFTImageContainer}>
              <PixelPreview
                colorMap={nft.colorMap || []}
                size={120}
                backgroundColor={nft.color || '#000'}
              />
              <div className={styles.realNFTPlayOverlay}>
                <button
                  className={`${styles.realNFTPlayButton} ${playingNFTId === nft.id ? styles.playing : ''}`}
                  onClick={() => handlePlayNFT(nft)}
                >
                  {playingNFTId === nft.id ? '⏸️' : '▶️'}
                </button>
              </div>
            </div>

            {/* NFT Info */}
            <div className={styles.realNFTInfo}>
              <h3 className={styles.realNFTTitle}>
                {nft.songName || 'Untitled Song'}
              </h3>
              <p className={styles.realNFTArtist}>
                by {formatWalletAddress(nft.createdBy)}
              </p>
              <div className={styles.realNFTMeta}>
                <span className={styles.realNFTDate}>
                  {formatDate(nft.createdAt)}
                </span>
                <span className={styles.realNFTTempo}>
                  {nft.tempo || 120} BPM
                </span>
              </div>
            </div>

            {/* Hover Effects */}
            <div className={styles.realNFTHoverEffects}>
              <div className={styles.realNFTScanLine}></div>
              <div className={styles.realNFTCornerGlow}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className={styles.showcaseCTA}>
        <button 
          className={styles.ctaButton}
          onClick={() => window.location.href = '/marketplace'}
        >
          🛒 View All NFTs
        </button>
        <button 
          className={styles.ctaButtonSecondary}
          onClick={() => window.location.href = '/login'}
        >
          🎵 Create Your Own
        </button>
      </div>
    </section>
  );
};

export default RealMusicNFTs;
