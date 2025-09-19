'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from "@/app/assets/styles/layouts/MainPage.module.css";
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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
import CollectionSlider from '../../components/collections/CollectionSlider';
import Footer from '../../components/layout/Footer';
import SignInUnautorizedModal from '../../components/modals/SignInUnautorizedModal';
import NFTDetailModal from '../../components/modals/NFTDetailModal';
import PixelPreview from '../../components/machines/PixelPreview';

const CollectionsScreen = () => {
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
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  const [playQueue, setPlayQueue] = useState<NFT[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { user, authenticated } = useAuth();
  const router = useRouter();

  // Collection categories configuration
  const collectionCategories = [
    {
      id: 'gaming',
      title: 'Gaming Soundtracks',
      subtitle: 'Iconic music from your favorite games',
      icon: '🎮',
      collections: topCollections.filter(item => 
        item.createdBy !== user?.uid && 
        (item.category === 'gaming' || item.type === 'pokemon' || item.type === 'mario')
      )
    },
    {
      id: 'anime',
      title: 'Anime Collections',
      subtitle: 'Epic soundtracks from anime series',
      icon: '🎌',
      collections: topCollections.filter(item => 
        item.createdBy !== user?.uid && 
        (item.category === 'anime' || item.type === 'dbz')
      )
    },
    {
      id: 'artists',
      title: 'Popular Artists',
      subtitle: 'Music from famous artists and musicians',
      icon: '🎤',
      collections: topCollections.filter(item => 
        item.createdBy !== user?.uid && 
        (item.category === 'artists' || item.type === 'snoop-dogg')
      )
    },
    {
      id: 'soundfx',
      title: 'Sound Effects',
      subtitle: 'Professional audio effects and samples',
      icon: '🔊',
      collections: topCollections.filter(item => 
        item.createdBy !== user?.uid && item.category === 'soundfx'
      )
    },
    {
      id: 'premium',
      title: 'Premium Collections',
      subtitle: 'Exclusive and high-quality content',
      icon: '💎',
      collections: topCollections.filter(item => 
        item.createdBy !== user?.uid && item.category === 'premium'
      )
    },
    {
      id: 'all',
      title: 'All Collections',
      subtitle: 'Browse everything in one place',
      icon: '🎵',
      collections: topCollections.filter(item => item.createdBy !== user?.uid)
    }
  ];

  // Initialize audio context on first user interaction
  const initializeAudioContext = () => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Audio context resumed successfully');
        }).catch(console.error);
      }
    }
  };

  useEffect(() => {
    const fetchCollectionsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch collections data
        const collectionsSnapshot = await getDocs(collection(db, "topCollections"));
        
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
          nftsCount: col.nfts?.length || 0,
          nfts: col.nfts
        })));
        
      } catch (error) {
        console.error('Error fetching collections data:', error);
        setError('Failed to load collections data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollectionsData();
  }, [user, authenticated]);

  const fetchNFTsForCollection = async (nftIds: string[]): Promise<NFT[]> => {
    if (!nftIds || nftIds.length === 0) return [];
    
    try {
      console.log('Fetching NFTs for collection with IDs:', nftIds);
      
      // Fetch each NFT individually
      const nftPromises = nftIds.map(async (nftId) => {
        try {
          const nftDoc = await getDoc(doc(db, "signatures", nftId));
          if (nftDoc.exists()) {
            return { ...(nftDoc.data() as NFT), id: nftDoc.id };
          } else {
            console.warn(`NFT with ID ${nftId} not found`);
            return null;
          }
        } catch (error) {
          console.error(`Error fetching NFT ${nftId}:`, error);
          return null;
        }
      });
      
      const nfts = await Promise.all(nftPromises);
      const validNFTs = nfts.filter((nft): nft is NFT => nft !== null);
      
      console.log(`Successfully fetched ${validNFTs.length} out of ${nftIds.length} NFTs`);
      return validNFTs;
    } catch (error) {
      console.error('Error fetching NFTs for collection:', error);
      return [];
    }
  };

  const handleViewCollection = async (collectionId: string) => {
    const selected = topCollections.find(item => item.id === collectionId);
    if (selected) {
      console.log('=== COLLECTION SELECTION DEBUG ===');
      console.log('Selected collection:', selected);
      console.log('Collection name:', selected.collectionName);
      console.log('Collection nfts:', selected.nfts);
      console.log('nfts type:', typeof selected.nfts);
      console.log('nfts length:', selected.nfts?.length);
      
      // Check if nfts exists and is an array
      if (!selected.nfts || !Array.isArray(selected.nfts)) {
        console.warn('Collection has no nfts or it\'s not an array:', selected.nfts);
        setSelectedCollection(selected);
        setCollectionNFTs([]);
        setIsCollectionViewOpen(true);
        return;
      }
      
      // Fetch NFTs for this collection
      const collectionNFTs = await fetchNFTsForCollection(selected.nfts);
      
      console.log('Fetched NFTs for collection:', collectionNFTs.length);
      console.log('NFT IDs in collection:', collectionNFTs.map(nft => nft.id));
      console.log('=== END DEBUG ===');
      
      setSelectedCollection(selected);
      setCollectionNFTs(collectionNFTs);
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
    setPlayQueue([]);
    setCurrentQueueIndex(0);
  };

  const handleViewNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    setIsNFTModalOpen(true);
  };

  const handleCloseNFTModal = () => {
    setIsNFTModalOpen(false);
    setSelectedNFT(null);
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
      setPlayQueue([]);
      setCurrentQueueIndex(0);
    } else {
      // Start playing from first song with queue
      setPlayQueue([...collectionNFTs]);
      setCurrentQueueIndex(0);
      setIsPlayingAll(true);
      handlePlayNFT(collectionNFTs[0]);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...collectionNFTs].sort(() => Math.random() - 0.5);
    setCollectionNFTs(shuffled);
    
    // If currently playing all, update the queue and continue from current position
    if (isPlayingAll && playQueue.length > 0) {
      const currentPlayingNFT = playQueue[currentQueueIndex];
      const newIndex = shuffled.findIndex(nft => nft.id === currentPlayingNFT?.id);
      setPlayQueue(shuffled);
      setCurrentQueueIndex(newIndex >= 0 ? newIndex : 0);
    }
  };

  const handleNext = () => {
    if (playQueue.length > 0 && currentQueueIndex < playQueue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIndex);
      handlePlayNFT(playQueue[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (playQueue.length > 0 && currentQueueIndex > 0) {
      const prevIndex = currentQueueIndex - 1;
      setCurrentQueueIndex(prevIndex);
      handlePlayNFT(playQueue[prevIndex]);
    }
  };

  const handlePlayNFT = (nft: NFT) => {
    if (!nft.colorMap || nft.colorMap.length === 0) {
      console.warn('NFT has no colorMap data:', nft);
      return;
    }

    // Initialize audio context on first interaction
    initializeAudioContext();

    // If clicking the same NFT that's playing, pause it
    if (isPlaying && playingId === nft.id) {
      stopMelodyRef?.();
      stopDrumRef?.();
      setIsPlaying(false);
      setPlayingId(null);
      setStopMelodyRef(null);
      setStopDrumRef(null);
      return;
    }

    stopMelodyRef?.();
    stopDrumRef?.();

    const melody = nft.colorMap.map(({ noteIndex, time }) => ({ noteIndex, time }));
    const tempo = nft.tempo || 300;
    const noteFreqMap = notes.map((n) => n[1]);

    console.log('Playing NFT:', {
      id: nft.id,
      songName: nft.songName,
      melodyLength: melody.length,
      tempo,
      noteFreqMapLength: noteFreqMap.length,
      melody: melody.slice(0, 5) // Show first 5 notes for debugging
    });

    setIsPlaying(true);
    setPlayingId(nft.id);

    // Start drum loop
    const stopDrum = playDrumLoop(tempo, () => {});
    setStopDrumRef(() => stopDrum);

    // Start melody
    const stopMelody = playMelody(
      melody,
      tempo,
      noteFreqMap,
      () => {
        console.log('NFT playback completed:', nft.id);
        stopDrum?.();
        setIsPlaying(false);
        setPlayingId(null);
        setStopMelodyRef(null);
        setStopDrumRef(null);
        
        // If playing all and there are more songs in queue, play next
        if (isPlayingAll && playQueue.length > 0) {
          const nextIndex = currentQueueIndex + 1;
          if (nextIndex < playQueue.length) {
            setCurrentQueueIndex(nextIndex);
            // Small delay before playing next song
            setTimeout(() => {
              handlePlayNFT(playQueue[nextIndex]);
            }, 500);
          } else {
            // Reached end of queue
            setIsPlayingAll(false);
            setPlayQueue([]);
            setCurrentQueueIndex(0);
          }
        }
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
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Community Collections</h2>
              <p className={styles.sectionSubtitle}>Discover amazing music from creators worldwide</p>
            </div>
            
            {/* Collection Sliders by Category */}
            {collectionCategories.map((category) => (
              <CollectionSlider
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                icon={category.icon}
                collections={category.collections}
                onCollectionClick={handleViewCollection}
                selectedCollectionId={selectedCollection?.id}
              />
            ))}
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
              onNext={handleNext}
              onPrevious={handlePrevious}
              isPlaying={isPlayingAll}
              canGoNext={playQueue.length > 0 && currentQueueIndex < playQueue.length - 1}
              canGoPrevious={playQueue.length > 0 && currentQueueIndex > 0}
            />
            
            <div className={styles.playlistContainer}>
              <div className={styles.playlistHeader}>
                <div className={styles.playlistInfo}>
                  <span className={styles.playlistTitle}>Playlist</span>
                  <span className={styles.songCount}>{collectionNFTs.length} songs</span>
                </div>
              </div>
              
              <div className={styles.twoColumnLayout}>
                {/* Left Column - Song List */}
                <div className={styles.playlistColumn}>
                  <div className={styles.columnHeader}>
                    <h3>🎵 Track List</h3>
                    <p>Click to play or view details</p>
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
                          onView={handleViewNFT}
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

                {/* Right Column - Currently Playing / Description */}
                <div className={styles.infoColumn}>
                  <div className={styles.columnHeader}>
                    <h3>🎧 Now Playing</h3>
                    <p>Track information and details</p>
                  </div>
                  <div className={styles.nowPlayingInfo}>
                    {playingId && collectionNFTs.find(nft => nft.id === playingId) ? (
                      (() => {
                        const currentNFT = collectionNFTs.find(nft => nft.id === playingId)!;
                        return (
                          <div className={styles.currentTrack}>
                            <div className={styles.trackVisual}>
                              <PixelPreview
                                colorMap={currentNFT.colorMap || []}
                                size={150}
                                backgroundColor={currentNFT.color || '#000'}
                              />
                              {isPlaying && (
                                <div className={styles.playingIndicator}>
                                  <div className={styles.equalizer}>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                    <div className={styles.bar}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className={styles.trackDetails}>
                              <h4 className={styles.trackTitle}>{currentNFT.songName || 'Untitled'}</h4>
                              <p className={styles.trackDescription}>
                                {currentNFT.machineType ? `Created with ${currentNFT.machineType} machine` : 'Musical NFT'}
                              </p>
                              <div className={styles.trackStats}>
                                <div className={styles.stat}>
                                  <span className={styles.statLabel}>Tempo:</span>
                                  <span className={styles.statValue}>{currentNFT.tempo || 'Unknown'} BPM</span>
                                </div>
                                <div className={styles.stat}>
                                  <span className={styles.statLabel}>Notes:</span>
                                  <span className={styles.statValue}>{currentNFT.colorMap?.length || 0}</span>
                                </div>
                                <div className={styles.stat}>
                                  <span className={styles.statLabel}>Duration:</span>
                                  <span className={styles.statValue}>
                                    {currentNFT.tempo ? Math.floor(120 / (currentNFT.tempo / 60)) : 'Unknown'}s
                                  </span>
                                </div>
                              </div>
                              {currentNFT.isCollaborative && currentNFT.authors && (
                                <div className={styles.collaborativeInfo}>
                                  <span className={styles.collaborativeIcon}>🎵</span>
                                  <span>Collaborative track with {currentNFT.authors.length} author(s)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className={styles.noTrackPlaying}>
                        <div className={styles.noTrackIcon}>🎵</div>
                        <h4>No track playing</h4>
                        <p>Select a track from the playlist to see details here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />

        {/* NFT Detail Modal */}
        <NFTDetailModal
          nft={selectedNFT}
          isOpen={isNFTModalOpen}
          onClose={handleCloseNFTModal}
          onPlay={handlePlayNFT}
          isPlaying={isPlaying && playingId === selectedNFT?.id}
        />
      </div>
    </>
  );
};

export default CollectionsScreen;