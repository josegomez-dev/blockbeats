import NeonSlider from '@/components/NeonSlider';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import SignInUnautorizedModal from '@/components/SignInUnautorizedModal';
import GalleryHeader from '@/components/GalleryHeader';
import { NFT } from '@/types/nftTypes';

const GalleryScreen = () => {

  const [userNFTS, setUserNFTS] = React.useState<NFT[]>([]);
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      if (user) {
        setUserNFTS(nfts.filter(item => item.createdBy === user.uid));
      }
    };
    fetchNFTs();
  }, [user]);

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
        <GalleryHeader title="Explore My Gallery." />

        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto", padding: '15px' }}>
          {userNFTS.length <= 0 ? (
            <div className={styles.modalContent}>
              <br />
              <h2>No NFTs Found</h2>
              <p>You haven't created any NFTs yet. <br /> Start creating your own unique NFTs today!</p>
              <br />
              <br />
              <Link href="/dashboard" className={styles.submitBtn}>Create NFT</Link>
              <br />
              <br />
            </div>
          ) : (
            <p>Here you can view all the NFTs you have created.</p>
          )}
        </div>

        <div style={{ marginTop: '-60px' }}>
          <NeonSlider
            slides={userNFTS.map(nft => ({
              id: nft.id,
              songName: nft.songName || '',
              colorMap: nft.colorMap || [],
              notesPlayed: (nft.notesPlayed || []).join(','),
              createdBy: nft.createdBy || '',
              createdAt: new Date().toISOString(), // or use nft.createdAt if available
              tempo: nft.tempo, // default tempo or use nft.tempo if available
              color: nft.color
            }))}
          />
        </div>

        <br />


      </div>
    </>
  );
};

export default GalleryScreen;
