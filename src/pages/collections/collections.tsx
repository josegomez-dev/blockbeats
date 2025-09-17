'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from "@/app/assets/styles/layouts/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import CollectionsSlider from '../../components/features/collectionSlider';
import { useRouter } from 'next/router';
import PixelPreview from '../../components/machines/PixelPreview';
import { notes } from "@/utils/constants/musicDrawingMachine";
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import Modal from 'react-responsive-modal';
import GalleryHeader from '../../components/layout/GalleryHeader';
import { NFT } from '@/types/nftTypes';
import Image from 'next/image';
import Footer from '../../components/layout/Footer';

const CollectionsScreen = () => {

  const [userNFTS, setUserNFTS] = React.useState<NFT[]>([]);
  const [topCollections, setTopCollections] = React.useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = React.useState<any | null>();
  const [collectionNFTs, setCollectionNFTs] = React.useState<NFT[]>([]);
  const [isCollectionViewOpen, setIsCollectionViewOpen] = React.useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedForCollection, setSelectedForCollection] = React.useState<string[]>([]);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const [stopMelodyRef, setStopMelodyRef] = React.useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = React.useState<(() => void) | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setUserNFTS(nfts);
      if (nfts.length > 0) {
        const firstCollection = nfts[0].id;
        const filteredNFTs = nfts.filter(nft => nft.id === firstCollection);
        setSelectedCollection({ id: firstCollection, collectionName: "My Collection" });
        setCollectionNFTs(filteredNFTs);
        setSelectedForCollection(filteredNFTs.map(nft => nft.id));
      }
    };
    fetchNFTs();
  }, [user]);

  useEffect(() => {
    const fetchTopCollections = async () => {
      const querySnapshot = await getDocs(collection(db, "topCollections"));
      const topCollections = querySnapshot.docs.map((doc) => ({ ...(doc.data() as any), id: doc.id }));
      setTopCollections(topCollections);
    };
    fetchTopCollections();
  }, []);

  const handleViewCollection = async (collectionId: string) => {
    const selected = topCollections.find(item => item.id === collectionId);
    const filtered = userNFTS.filter(nft => selected.nfts.includes(nft.id));
    setSelectedCollection(selected);
    setCollectionNFTs(filtered);
    setSelectedForCollection(selected.nfts);
    setIsCollectionViewOpen(true);
  };

  const saveSelection = async () => {
    if (!selectedCollection) return;

    const updatedNFTs = selectedForCollection.filter(id => userNFTS.some(nft => nft.id === id));
    const updatedCollection = {
      ...selectedCollection,
      nfts: updatedNFTs
    };

    // Update the collection in the database
    const collectionRef = doc(db, "topCollections", selectedCollection.id);
    await updateDoc(collectionRef, updatedCollection);

    // Update local state
    setSelectedCollection(updatedCollection);
    setIsModalOpen(false);

    // Refresh the collection view
    const filteredNFTs = userNFTS.filter(nft => updatedNFTs.includes(nft.id));
    setCollectionNFTs(filteredNFTs);
    setSelectedForCollection(updatedNFTs);
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
      }
    );

    setStopMelodyRef(() => stopMelody);
  };

  const toggleNFTSelection = (nftId: string) => {
    setSelectedForCollection((prev) =>
      prev.includes(nftId) ? prev.filter(id => id !== nftId) : [...prev, nftId]
    );
  };

  return (
    <>
      <div className="gallery-screen">
        <GalleryHeader title="Explore Top Collections." />
        <div className='test-bg'>

            <br />
            <br />
            <br />
            <br />
            <br />

            <div className="bannerContainer banner-container-center">
              <h1><span className='glitch'>Top Collections</span></h1>
              <p>Trade and explore unique NFTs created by our community.</p>
            </div>

            <br />
            <button onClick={() => router.push('/createCollections')} className={`${styles.submitBtn} button-no-animation`}>Create Top Collection</button>
        </div>
    <br />
            <CollectionsSlider 
              id="myCollections"
            //   title="My Collections" 
              fullWidth 
              topCollections={topCollections.filter(item => item.createdBy === user?.uid)} 
              onSelectCollection={handleViewCollection} 
            /> 
            <CollectionsSlider 
              id="topFanCollections"
              // title="Top Fan Collections" 
              fullWidth topCollections={topCollections.filter(item => item.createdBy !== user?.uid)} 
              onSelectCollection={handleViewCollection} 
            /> 

           {isCollectionViewOpen && selectedCollection && (
              <div className={styles.collectionDrawer} style={{ backgroundColor: selectedCollection.collectionColor || '#000' }}>
                <div className={styles.collectionHeader}>
                  <h4 className='glitch'>{selectedCollection.collectionName || "Unnamed Collection"}</h4>
                  <br />
                  {/* <p>{selectedCollection.collectionDescription}</p> */}
                  <div>
                    <button onClick={() => setIsModalOpen(true)} className={styles.submitBtn} style={{ animation: 'none' }}>Manage</button>
                    <button onClick={() => setIsCollectionViewOpen(false)} className={styles.submitBtn} style={{ animation: 'none' }}>Close</button>
                  </div>
                </div>
                <div className={styles.collectionGrid}>
                  {collectionNFTs.length > 0 ? (
                    collectionNFTs.map((nft) => (
                      <div key={nft.id} className={styles.nftCard}>
                        <h4>{nft.songName}</h4>
                        <PixelPreview
                          colorMap={nft.colorMap || []}
                          size={100}
                          backgroundColor={nft.color || '#000'}
                        />
                        <button
                          onClick={() => handlePlayNFT(nft)}
                          disabled={isPlaying && playingId === nft.id}
                          className={styles.submitBtn}
                          style={{ backgroundColor: isPlaying && playingId === nft.id ? "var(--neon-color)" : "transparent", animation: 'none' }}
                        >
                          {(isPlaying && playingId === nft.id) ? "🎧..." : "▶️"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No NFTs in this collection.</p>
                  )}
                </div>
              </div>
            )}

            {isModalOpen && (
              <Modal 
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                showCloseIcon={false}
                center
                        classNames={{
                          modal: styles.modal,
                          // overlay: stylesMain.modalOverlay,
                          // closeButton: stylesMain.closeButton,
                        }}
                        styles={{ modal: { width: '100%', background: 'black' } }}
              >
                <div className={`${styles.modalContent} text-center`}>
                        <br />
                        <br />
                  <button
                    className={styles.submitBtn}
                    onClick={saveSelection}
                  >
                    Save Selection
                  </button>

                  <button className={styles.submitBtn} onClick={() => setIsModalOpen(false)}>Close</button>

                  <div className={'gallery-grid gallery-grid-flex'}>
                    {userNFTS.map((nft) => (
                      <div key={nft.id} className={`${styles.nftCard} gallery-item`}>
                        <h4>{nft.songName}</h4>
                        <PixelPreview
                          colorMap={nft.colorMap || []}
                          size={80}
                        />
                        <button
                          className={styles.submitBtn}
                          onClick={() => toggleNFTSelection(nft.id)}
                          style={{ backgroundColor: selectedForCollection.includes(nft.id) ? '#0af' : '#222', color: 'white' }}
                        >
                          {selectedForCollection.includes(nft.id) ? '✓' : 'Add'}
                        </button>
                        <button
                          className={styles.submitBtn}
                          onClick={() => handlePlayNFT(nft)}
                          disabled={isPlaying && playingId === nft.id}
                          style={{ backgroundColor: isPlaying && playingId === nft.id ? "var(--neon-color)" : "transparent" }}
                        >
                          {(isPlaying && playingId === nft.id) ? "🎧..." : "▶️"}
                        </button>
                      </div>
                    ))}
                  </div>
                
                </div>
              </Modal>
            )}


          <Footer />


      </div>
    </>
  );
};

export default CollectionsScreen;