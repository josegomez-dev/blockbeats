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
import SidebarMenu from '@/components/SidebarMenu';

const CollectionsScreen = () => {

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
        <br />

        <div style={{ textAlign: "center", margin: "0 auto", padding: "25px" }}>
          <h2><p className="glitch">Explore <span data-text="TOP FANS" className="glitch">TOP FANS</span> COLLECTIONS</p></h2>
          <br />
          <button onClick={() => router.push('/createTopCollection')} className={styles.submitBtn}>Create Top Fan Collection</button>
          <CollectionsSlider title='' fullWidth topCollections={topCollections} />
        </div>
        <br />
        <br />
        <br />

      </div>

      <Footer />
    </>
  );
};

export default CollectionsScreen;
