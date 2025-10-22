import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from "@/app/assets/styles/layouts/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import SignInUnautorizedModal from '../../components/modals/SignInUnautorizedModal';
import GalleryHeader from '../../components/layout/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import { playDrumPattern } from "@/utils/helpers/drumPatternHelper";
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

  // Contract configuration - you'll need to set this after deploying your contract
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';

  const { user, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Safe JSON parsing function
        const safeJsonParse = (jsonString: any) => {
          try {
            if (typeof jsonString === 'object' && jsonString !== null) {
              return jsonString;
            }
            if (typeof jsonString === 'string') {
              return JSON.parse(jsonString);
            }
            return null;
          } catch (error) {
            console.warn('Failed to parse JSON:', jsonString, error);
            return null;
          }
        };
        
        // Detect if this is an old format NFT (has direct colorMap) or new format (has pixelData)
        const isOldFormat = data.colorMap && Array.isArray(data.colorMap);
        const isNewFormat = data.pixelData || data.drawingMachine || data.drumMachine;
        
        console.log(`NFT ${doc.id}:`, {
          isOldFormat,
          isNewFormat,
          hasColorMap: !!data.colorMap,
          hasPixelData: !!data.pixelData,
          hasDrawingMachine: !!data.drawingMachine,
          hasDrumMachine: !!data.drumMachine,
          data
        });
        
        if (isOldFormat) {
          // Handle old format NFTs
          return {
            id: doc.id,
            ...data,
            songName: data.songName || data.name || 'Untitled',
            colorMap: data.colorMap || [],
            // Keep original structure for old NFTs
            createdBy: data.createdBy,
            description: data.description,
            tempo: data.tempo || 300,
            machineType: data.machineType || 'drawing', // Assume drawing for old NFTs
            tags: data.tags || [],
            isCollaborative: data.isCollaborative || false,
            authors: data.authors || [],
            isOldFormat: true
          } as NFT;
        } else {
          // Handle new format NFTs
          return {
            id: doc.id,
            ...data,
            // Map our Firebase fields to the expected NFT fields
            songName: data.name || 'Untitled',
            colorMap: data.pixelData ? safeJsonParse(data.pixelData) : [],
            drawingMachine: data.drawingMachine ? safeJsonParse(data.drawingMachine) : null,
            drumMachine: data.drumMachine ? safeJsonParse(data.drumMachine) : null,
            // Keep original fields for backward compatibility
            createdBy: data.createdBy,
            description: data.description,
            tempo: data.tempo || 300,
            machineType: data.machineType,
            tags: data.tags || [],
            isCollaborative: data.isCollaborative || false,
            authors: data.authors || [],
            isOldFormat: false
          } as NFT;
        }
      });
        
        console.log('Fetched NFTs:', nfts);
        setNFTs(nfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
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
    } else if (selectedCategory === 'classic') {
      filtered = nfts.filter(nft => nft.isOldFormat);
    } else if (selectedCategory === 'modern') {
      filtered = nfts.filter(nft => !nft.isOldFormat);
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
      collaborative: nfts.filter(nft => nft.isCollaborative).length,
      classic: nfts.filter(nft => nft.isOldFormat).length,
      modern: nfts.filter(nft => !nft.isOldFormat).length
    };
  }, [nfts]);

  const handlePlayNFT = (nft: NFT) => {
    if (isPlaying && playingNFTId === nft.id) return;

    console.log('Playing NFT:', nft);
    console.log('NFT colorMap:', nft.colorMap);
    console.log('NFT drawingMachine:', nft.drawingMachine);
    console.log('NFT drumMachine:', nft.drumMachine);

    stopMelodyRef?.();
    stopDrumRef?.();

    setIsPlaying(true);
    setPlayingNFTId(nft.id);

    const tempo = nft.tempo || 300;

    // Handle Music Drawing Machine songs (both old and new format)
    if ((nft.machineType === 'drawing' || nft.isOldFormat) && nft.colorMap && nft.colorMap.length > 0) {
      const melody = nft.colorMap.map(({ noteIndex, time }) => ({ noteIndex, time }));
      
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
    }
    // Handle Drum Designer songs
    else if (nft.machineType === 'drums' && nft.drumMachine) {
      console.log('Playing drum pattern NFT:', nft.drumMachine);
      
      // Parse drum machine data if it's a string
      let drumData;
      try {
        drumData = typeof nft.drumMachine === 'string' 
          ? JSON.parse(nft.drumMachine) 
          : nft.drumMachine;
      } catch (error) {
        console.error('Failed to parse drum machine data:', error);
        drumData = nft.drumMachine;
      }

      // Play the actual drum pattern with proper sounds
      if (drumData && drumData.grid && drumData.selectedSounds) {
        const stopDrum = playDrumPattern(
          {
            grid: drumData.grid,
            selectedSounds: drumData.selectedSounds
          },
          {
            tempo: tempo,
            steps: drumData.grid[0]?.length || 8,
            volume: 80,
            onStop: () => {
              setIsPlaying(false);
              setPlayingNFTId(null);
              setStopDrumRef(null);
            }
          }
        );
        setStopDrumRef(() => stopDrum);
      } else {
        console.warn('Invalid drum machine data:', drumData);
        // Fallback to basic drum loop
        const stopDrum = playDrumLoop(tempo, () => {
          setIsPlaying(false);
          setPlayingNFTId(null);
          setStopDrumRef(null);
        });
        setStopDrumRef(() => stopDrum);
      }
    }
    // Fallback for songs without proper data
    else {
      console.warn('No valid music data found for NFT:', nft.id);
      console.warn('NFT data:', {
        machineType: nft.machineType,
        isOldFormat: nft.isOldFormat,
        hasColorMap: !!nft.colorMap,
        colorMapLength: nft.colorMap?.length,
        hasDrumMachine: !!nft.drumMachine
      });
      setIsPlaying(false);
      setPlayingNFTId(null);
    }
  };


  if (!user || !authenticated) {
    return (
      <SignInUnautorizedModal 
        open={true}
        onClose={() => {}}
        pageName="Marketplace"
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
              contractAddress={CONTRACT_ADDRESS}
              tokenId={nft.tokenId}
              isMinted={false}
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
