import NeonSlider from '@/components/NeonSlider';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from '@/components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import CollectionsSlider from '@/components/CollectionsSlider';
import SignInUnautorizedModal from '@/components/SignInUnautorizedModal';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa'; // Uncomment if you want to use an icon for the back button
import GalleryHeader from '@/components/GalleryHeader';

const GalleryScreen = () => {

  type NFT = {
    id: string;
    createdBy?: string;
    songName?: string;
    colorMap?: any[];
    notesPlayed?: any[];
    img?: string;
    // add other properties as needed
  };

  const [userNFTS, setUserNFTS] = React.useState<NFT[]>([]);
  const [topCollections, setTopCollections] = React.useState<any[]>([]); // Adjust type as needed

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      if (user) {
        setUserNFTS(nfts.filter(item => item.createdBy === user.uid));
      }
    };
    fetchNFTs();
  }, []);

  useEffect(() => {
    const fetchTopCollections = async () => {
      const querySnapshot = await getDocs(collection(db, "topCollections"));
      const topCollections = querySnapshot.docs.map((doc) => ({ ...(doc.data() as any), id: doc.id }));
      setTopCollections(topCollections);
    };
    fetchTopCollections();
  }, []);

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
              img: nft.img || '/nft1.webp', // fallback image if not present
              songName: nft.songName || '',
              colorMap: nft.colorMap || [],
              notesPlayed: (nft.notesPlayed || []).join(','),
            }))}
          />
        </div>

        <br />


      </div>

      <Footer />
    </>
  );
};

export default GalleryScreen;
