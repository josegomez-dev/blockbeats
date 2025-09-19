'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from "@/app/assets/styles/layouts/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRouter } from 'next/router';
import { notes } from "@/utils/constants/musicDrawingMachine";
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import GalleryHeader from '../../components/layout/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import { TopCollections } from '@/types/topCollections';
import CollectionCard from '../../components/collections/CollectionCard';
import CollectionHeader from '../../components/collections/CollectionHeader';
import PlaylistItem from '../../components/collections/PlaylistItem';
import Footer from '../../components/layout/Footer';
import SignInUnautorizedModal from '../../components/modals/SignInUnautorizedModal';

const CollectionsScreen = () => {
  const [userNFTS, setUserNFTS] = useState<NFT[]>([]);
  const [topCollections, setTopCollections] = useState<TopCollections[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<TopCollections | null>(null);
  const [collectionNFTs, setCollectionNFTs] = useState<NFT[]>([]);
  const [isCollectionViewOpen, setIsCollectionViewOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [stopMelodyRef, setStopMelodyRef] = useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = useState<(() => void) | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCollectionsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both collections and NFTs in parallel
        const [collectionsSnapshot, nftsSnapshot] = await Promise.all([
          getDocs(collection(db, "topCollections")),
          authenticated && user ? getDocs(collection(db, "signatures")) : Promise.resolve(null)
        ]);
        
        // Process collections data
        const topCollections = collectionsSnapshot.docs.map((doc) => ({ 
          ...(doc.data() as TopCollections), 
          id: doc.id 
        }));
        setTopCollections(topCollections);
        console.log('Fetched top collections:', topCollections.length);
        console.log('Collections data:', topCollections.map(col => ({
          id: col.id,
          name: col.collectionName,
          nftsCount: col.nftsList?.length || 0,
          nftsList: col.nftsList
        })));
        
        // Process NFTs data (only if user is authenticated)
        if (nftsSnapshot && authenticated && user) {
          const nfts = nftsSnapshot.docs.map((doc) => ({ 
            ...(doc.data() as NFT), 
            id: doc.id 
          })) as NFT[];
          setUserNFTS(nfts);
          console.log('Fetched NFTs for collections:', nfts.length);
          console.log('NFT IDs:', nfts.map(nft => nft.id));
        } else {
          setUserNFTS([]);
          console.log('No NFTs fetched - user not authenticated');
        }

        console.log(topCollections);
        
      } catch (error) {
        console.error('Error fetching collections data:', error);
        setError('Failed to load collections data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollectionsData();
  }, [user, authenticated]);

  const handleViewCollection = async (collectionId: string) => {
    const selected = topCollections.find(item => item.id === collectionId);
    if (selected) {
      console.log('=== COLLECTION SELECTION DEBUG ===');
      console.log('Selected collection:', selected);
      console.log('Collection name:', selected.collectionName);
      console.log('Collection nftsList:', selected.nftsList);
      console.log('nftsList type:', typeof selected.nftsList);
      console.log('nftsList length:', selected.nftsList?.length);
      
      console.log('Available NFTs count:', userNFTS.length);
      console.log('Available NFT IDs:', userNFTS.map(nft => nft.id));
      
      // Check if nftsList exists and is an array
      if (!selected.nftsList || !Array.isArray(selected.nftsList)) {
        console.warn('Collection has no nftsList or it\'s not an array:', selected.nftsList);
        setSelectedCollection(selected);
        setCollectionNFTs([]);
        setIsCollectionViewOpen(true);
        return;
      }
      
      // Filter NFTs that match the collection's nftsList IDs
      const filtered = userNFTS.filter(nft => {
        const isMatch = selected.nftsList?.includes(nft.id);
        if (isMatch) {
          console.log(`✅ Found match: NFT ${nft.id} is in collection`);
        }
        return isMatch;
      });
      
      // Log unmatched IDs for debugging
      const unmatchedIds = selected.nftsList?.filter(id => 
        !userNFTS.some(nft => nft.id === id)
      ) || [];
      
      console.log('Filtered NFTs count:', filtered.length);
      console.log('Matched NFT IDs:', filtered.map(nft => nft.id));
      console.log('Unmatched IDs in collection:', unmatchedIds);
      console.log('=== END DEBUG ===');
      
      setSelectedCollection(selected);
      setCollectionNFTs(filtered);
      setIsCollectionViewOpen(true);
      
      // Smooth scroll to the collection view after a short delay
      setTimeout(() => {
        const collectionView = document.querySelector('[data-collection-view]');
        if (collectionView) {
          collectionView.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } else {
      console.error('Collection not found:', collectionId);
    }
  };

  const handleCloseCollection = () => {
    setIsCollectionViewOpen(false);
    setSelectedCollection(null);
    setCollectionNFTs([]);
    stopMelodyRef?.();
    stopDrumRef?.();
    setIsPlaying(false);
    setPlayingId(null);
    setIsPlayingAll(false);
  };

  const handlePlayAll = () => {
    if (collectionNFTs.length === 0) return;
    
    if (isPlayingAll) {
      // Stop all playback
      stopMelodyRef?.();
      stopDrumRef?.();
      setIsPlayingAll(false);
      setIsPlaying(false);
      setPlayingId(null);
    } else {
      // Start playing from first song
      handlePlayNFT(collectionNFTs[0]);
      setIsPlayingAll(true);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...collectionNFTs].sort(() => Math.random() - 0.5);
    setCollectionNFTs(shuffled);
  };

  const handlePlayNFT = (nft: NFT) => {
    if (!nft.colorMap || nft.colorMap.length === 0 || (isPlaying && playingId === nft.id)) return;

    stopMelodyRef?.();
    stopDrumRef?.();

    const melody = nft.colorMap.map(({ noteIndex, time }) => ({ noteIndex, time }));
    const tempo = nft.tempo || 300;

    setIsPlaying(true);
    setPlayingId(nft.id);

    const stopDrum = playDrumLoop(tempo, () => {});
    setStopDrumRef(() => stopDrum);

    const stopMelody = playMelody(
      melody,
      tempo,
      notes.map((n) => n[1]),
      () => {
        stopDrum?.();
        setIsPlaying(false);
        setPlayingId(null);
        setStopMelodyRef(null);
        setStopDrumRef(null);
        setIsPlayingAll(false);
      }
    );

    setStopMelodyRef(() => stopMelody);
  };

  if (!user || !authenticated) {
    return <SignInUnautorizedModal open={true} onClose={() => {}} pageName="Collections" />;
  }

  return (
    <>
      <div className="gallery-screen">
        <GalleryHeader title="Your Music Collections" />
        
        <div className='test-bg'>
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className="bannerContainer banner-container-center">
            <h1><span className='glitch'>🎵 Collections</span></h1>
            <p>Discover and play curated playlists of musical NFTs</p>
          </div>
          <br />
          <button 
            onClick={() => router.push('/createCollections')} 
            className={`${styles.submitBtn} button-no-animation`}
          >
            Create New Collection
          </button>
        </div>

        {/* My Collections Section */}
        {topCollections.filter(item => item.createdBy === user?.uid).length > 0 && (
          <div className={styles.collectionsSection}>
            <h2 className={styles.sectionTitle}>Your Collections</h2>
            <div className={styles.collectionsGrid}>
              {topCollections
                .filter(item => item.createdBy === user?.uid)
                .map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onClick={handleViewCollection}
                    isSelected={selectedCollection?.id === collection.id}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Community Collections Section */}
        {topCollections.filter(item => item.createdBy !== user?.uid).length > 0 && (
          <div className={styles.collectionsSection}>
            <h2 className={styles.sectionTitle}>Community Collections</h2>
            <div className={styles.collectionsGrid}>
              {topCollections
                .filter(item => item.createdBy !== user?.uid)
                .map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onClick={handleViewCollection}
                    isSelected={selectedCollection?.id === collection.id}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Collection Playlist View */}
        {isCollectionViewOpen && selectedCollection && (
          <div className={styles.playlistView} data-collection-view>
            <CollectionHeader
              collection={selectedCollection}
              onClose={handleCloseCollection}
              onPlayAll={handlePlayAll}
              onShuffle={handleShuffle}
              isPlaying={isPlayingAll}
            />
            
            <div className={styles.playlistContainer}>
              <div className={styles.playlistHeader}>
                <div className={styles.playlistInfo}>
                  <span className={styles.playlistTitle}>Playlist</span>
                  <span className={styles.songCount}>{collectionNFTs.length} songs</span>
                </div>
              </div>
              
              <div className={styles.playlistItems}>
                {collectionNFTs.length > 0 ? (
                  collectionNFTs.map((nft, index) => (
                    <PlaylistItem
                      key={nft.id}
                      nft={nft}
                      index={index}
                      isPlaying={isPlaying && playingId === nft.id}
                      onPlay={handlePlayNFT}
                    />
                  ))
                ) : (
                  <div className={styles.emptyPlaylist}>
                    <div className={styles.emptyIcon}>🎵</div>
                    <h3>No songs in this collection</h3>
                    <p>This collection doesn't have any songs yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default CollectionsScreen;