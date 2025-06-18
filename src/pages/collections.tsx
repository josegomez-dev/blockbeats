'use client';

import NeonSlider from '@/components/NeonSlider';
import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from '@/components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import CollectionsSlider from '@/components/CollectionsSlider';
import SignInUnautorizedModal from '@/components/SignInUnautorizedModal';
import { useRouter } from 'next/router';
import PixelPreview from '@/components/PixelPreview';

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

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setUserNFTS(nfts);
      // if (user) {
      //   setUserNFTS(nfts.filter(item => item.createdBy === user.uid));
      // }
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
    // fetch signature based on selected.nfts id array
    console.log(userNFTS);
    const filtered = userNFTS.filter(nft => selected.nfts.includes(nft.id));
    console.log(filtered)
    if (!filtered.length) {
      console.error("No NFTs found for this collection");
      return;
    }
    
    setSelectedCollection(selected);
    setCollectionNFTs(filtered);
    setIsCollectionViewOpen(true);
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
      <div className="gallery-screen">
        <br />

        <div style={{ textAlign: "center", margin: "0 auto", padding: "25px" }}>
          <h2><p className="glitch">Explore <span data-text="TOP FANS" className="glitch">TOP FANS</span> COLLECTIONS</p></h2>
          <br />
          <button onClick={() => router.push('/createTopCollection')} className={styles.submitBtn}>Create Top Fan Collection</button>
          <CollectionsSlider title='' fullWidth topCollections={topCollections} onSelectCollection={handleViewCollection} />
        </div>

        {isCollectionViewOpen && selectedCollection && (
          <div className={styles.collectionDrawer}>
            <div className={styles.collectionHeader}>
              <h3>{selectedCollection.collectionName || "Unnamed Collection"}</h3>
              <button onClick={() => setIsCollectionViewOpen(false)} className={styles.submitBtn}>Close</button>
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
                  </div>
                ))
              ) : (
                <p>No NFTs in this collection.</p>
              )}
            </div>
          </div>
        )}

        <br /><br /><br />
      </div>
      <Footer />
    </>
  );
};

export default CollectionsScreen;