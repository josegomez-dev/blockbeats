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

  const { user, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setUserNFTS(nfts);
    };
    fetchNFTs();
  }, [user]);

  useEffect(() => {
    const fetchTopCollections = async () => {
      const querySnapshot = await getDocs(collection(db, "topCollections"));
      const topCollections = querySnapshot.docs.map((doc) => ({ ...(doc.data() as TopCollections), id: doc.id }));
      setTopCollections(topCollections);
    };
    fetchTopCollections();
  }, []);

  const handleViewCollection = async (collectionId: string) => {
    const selected = topCollections.find(item => item.id === collectionId);
    if (selected) {
      const filtered = userNFTS.filter(nft => selected.nftsList?.includes(nft.id));
      setSelectedCollection(selected);
      setCollectionNFTs(filtered);
      setIsCollectionViewOpen(true);
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

  // redirect to SignInUnauthorized
  if (!authenticated) {
    return <SignInUnauthorized />;
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
          <div className={styles.playlistView}>
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