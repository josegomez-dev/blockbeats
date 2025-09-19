import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from "@/app/assets/styles/layouts/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import SignInUnautorizedModal from '../../components/modals/SignInUnautorizedModal';
import GalleryHeader from '../../components/layout/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import { notes } from "@/utils/constants/musicDrawingMachine"; // for frequency mapping
import Head from 'next/head';
import { useRouter } from 'next/router';
import CategoryFilter from '../../components/marketplace/CategoryFilter';
import NFTCard from '../../components/marketplace/NFTCard';


const MarketplaceScreen = () => {

  const [nfts, setNFTs] = React.useState<NFT[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playingNFTId, setPlayingNFTId] = React.useState<string | null>(null);
  const [stopMelodyRef, setStopMelodyRef] = React.useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = React.useState<(() => void) | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setNFTs(nfts);
    };
    fetchNFTs();
  }, []);

  // Filter NFTs based on selected category and search query
  const filteredNFTs = useMemo(() => {
    let filtered = nfts;

    // Filter by category
    if (selectedCategory === 'all') {
      filtered = nfts;
    } else if (selectedCategory === 'collaborative') {
      filtered = nfts.filter(nft => nft.isCollaborative);
    } else {
      filtered = nfts.filter(nft => nft.machineType === selectedCategory);
    }

    // Filter by search query (name)
    if (searchQuery.trim()) {
      filtered = filtered.filter(nft => 
        nft.songName?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
    }

    return filtered;
  }, [nfts, selectedCategory, searchQuery]);

  // Calculate NFT counts for each category
  const nftCounts = useMemo(() => {
    return {
      all: nfts.length,
      drawing: nfts.filter(nft => nft.machineType === 'drawing').length,
      drums: nfts.filter(nft => nft.machineType === 'drums').length,
      voicemusic: nfts.filter(nft => nft.machineType === 'voicemusic').length,
      collaborative: nfts.filter(nft => nft.isCollaborative).length
    };
  }, [nfts]);

  const handlePlayNFT = (nft: NFT) => {
    if (isPlaying && playingNFTId === nft.id) return;

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


  if (!user) {
    return (
      <SignInUnautorizedModal 
        open={true}
        onClose={() => {}}
        pageName="Gallery"
      />
    );
  }


  return (
    <>
      <Head>
        <title>BlockBeats Marketplace - Trade & Discover Musical NFTs</title>
        <meta name="description" content="Explore the BlockBeats marketplace to discover, trade, and collect unique musical NFTs created by the community. Play and preview music before trading." />
        <meta name="keywords" content="BlockBeats marketplace, musical NFT trading, music NFT collection, NFT marketplace, Web3 music trading, crypto music, blockchain music" />
        <meta property="og:title" content="BlockBeats Marketplace - Trade & Discover Musical NFTs" />
        <meta property="og:description" content="Explore the BlockBeats marketplace to discover, trade, and collect unique musical NFTs created by the community. Play and preview music before trading." />
        <meta property="og:image" content="https://blockbeats-tau.vercel.app/images/logos/logo.webp" />
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
        <div className="bannerContainer banner-container-center">
          <h1><span className='glitch'>Marketplace</span></h1>
          <p>Trade and explore unique NFTs created by our community.</p>
          <br />
          <button onClick={() => router.push('/dashboard')} className={`${styles.submitBtn} button-no-animation`}>Create New NFT</button>
        </div>
      
      </div>


      <div className="gallery-screen gallery-screen-padding">
        {/* Search Filter */}
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Search NFTs by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchIcon}>🔍</div>
          </div>
          {searchQuery && (
            <div className={styles.searchResults}>
              Found {filteredNFTs.length} NFT{filteredNFTs.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          nftCounts={nftCounts}
        />

        {/* NFT Grid */}
        <div className="gallery-grid">
          {filteredNFTs.map((nft, index) => (
            <NFTCard
              key={nft.id || index}
              nft={nft}
              isPlaying={isPlaying && playingNFTId === nft.id}
              onPlay={handlePlayNFT}
            />
          ))}
          
          {filteredNFTs.length === 0 && (
            <div className={styles.noNftsMessage}>
              <h3>No NFTs found in this category</h3>
              <p>Try selecting a different category or create some new NFTs!</p>
              <button 
                onClick={() => router.push('/dashboard')} 
                className={styles.submitBtn}
              >
                Create New NFT
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
    </>
  );
};

export default MarketplaceScreen;
