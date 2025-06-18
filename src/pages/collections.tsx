'use client';

import NeonSlider from '@/components/NeonSlider';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from '@/components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import CollectionsSlider from '@/components/CollectionsSlider';
import SignInUnautorizedModal from '@/components/SignInUnautorizedModal';
import { useRouter } from 'next/router';
import PixelPreview from '@/components/PixelPreview';
import { notes } from "@/utils/constants/musicDrawingMachine";
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import Modal from 'react-responsive-modal';
import Image from 'next/image';

const CollectionsScreen = () => {
  type NFT = {
    id: string;
    createdBy?: string;
    songName?: string;
    colorMap?: any[];
    notesPlayed?: any[];
    collectionId?: string;
  };

  const [userNFTS, setUserNFTS] = React.useState<NFT[]>([]);
  const [topCollections, setTopCollections] = React.useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = React.useState<any | null>(null);
  const [collectionNFTs, setCollectionNFTs] = React.useState<NFT[]>([]);
  const [isCollectionViewOpen, setIsCollectionViewOpen] = React.useState(false);

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
    const tempo = 300;

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
        <br />

        <div style={{ textAlign: "center", margin: "0 auto", padding: "25px" }}>
          <h2><p className="glitch">Explore <span data-text="TOP" className="glitch">TOP</span> COLLECTIONS</p></h2>
          <br />
          <button onClick={() => router.push('/createTopCollection')} className={styles.submitBtn}>Create Top Fan Collection</button>
          <br />
          <p>
            Here you can view all the top fan collections created by our community. <br />
            Each collection is a unique set of NFTs that fans have created to show their support.
          </p>
          <CollectionsSlider title='' fullWidth topCollections={topCollections} onSelectCollection={handleViewCollection} />
        </div>

        {isCollectionViewOpen && selectedCollection && (
          <div className={styles.collectionDrawer}>
            <div className={styles.collectionHeader}>
              <h3>{selectedCollection.collectionName || "Unnamed Collection"}</h3>
              <div>
                <button onClick={() => setIsModalOpen(true)} className={styles.submitBtn}>Manage NFTs</button>
                <button onClick={() => setIsCollectionViewOpen(false)} className={styles.submitBtn}>Close</button>
              </div>
            </div>
            <div className={styles.collectionGrid}>
              {collectionNFTs.length > 0 ? (
                collectionNFTs.map((nft) => (
                  <div key={nft.id} className={styles.nftCard}>
                    <h4>{nft.songName}</h4>
                    <PixelPreview
                      colorMap={nft.colorMap || []}
                      notesCount={nft.notesPlayed?.length || 0}
                      size={100}
                    />
                    <button
                      onClick={() => handlePlayNFT(nft)}
                      disabled={isPlaying && playingId === nft.id}
                      className={styles.submitBtn}
                      style={{ backgroundColor: isPlaying && playingId === nft.id ? "var(--neon-color)" : "transparent" }}
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
          classNames={{ modal: isModalOpen ? styles.modal : styles.modalClosed }}
          styles={ { modal: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' } } }
        >
          <h3>Select NFTs for Collection</h3>
          <div className={'gallery-grid'} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {userNFTS.map((nft) => (
              <div key={nft.id} className={styles.nftCard}>
                <h4>{nft.songName}</h4>
                <PixelPreview
                  colorMap={nft.colorMap || []}
                  notesCount={nft.notesPlayed?.length || 0}
                  size={80}
                />
                <button
                  className={styles.submitBtn}
                  onClick={() => toggleNFTSelection(nft.id)}
                  style={{ backgroundColor: selectedForCollection.includes(nft.id) ? '#0af' : '#222' }}
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

          <button
            className={styles.submitBtn}
            onClick={saveSelection}
          >
            Save Selection
          </button>

          <button className={styles.submitBtn} onClick={() => setIsModalOpen(false)}>Close</button>
        </Modal>
        )}

        <br /> 
        <br /> 
        <br /> 
        <hr /> 
        <div style={{backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
          <br />
          <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
            <Image
              src="/avatar/phase-9.webp"
              alt="Collections Banner"
              width={250}
              height={300}
              style={{ marginBottom: '20px' }}
            />

            <p>
              Explore and view all the top fan collections created by the Blockbeats community. Click on any collection to view its details.
              <br />
              <br />
              <br />
              <Link href="/dashboard" className={styles.submitBtn} style={{ marginTop: '10px' }}>Back to Dashboard</Link>
            </p>
          </div>

          <br />
          <br />
          <br />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CollectionsScreen;
