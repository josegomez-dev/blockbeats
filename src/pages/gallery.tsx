import NeonSlider from '@/components/NeonSlider';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from '@/components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PixelPreview from '@/components/PixelPreview';
import { Modal } from "react-responsive-modal";
import CollectionsSlider from '@/components/CollectionsSlider';
import SignInUnautorizedModal from '@/components/SignInUnautorizedModal';
import { useRouter } from 'next/router';

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

  const [nfts, setNFTs] = React.useState<NFT[]>([]);
  const [userNFTS, setUserNFTS] = React.useState<NFT[]>([]);
  const [topCollections, setTopCollections] = React.useState<any[]>([]); // Adjust type as needed

  const [showViewModal, setShowViewModal] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setNFTs(nfts);
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

  const handleViewNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowViewModal(true);
  };
  
  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedNFT(null);
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
        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
          <br />
          <br />
          <h2><p className="glitch">My Collection</p></h2>

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
        
        {selectedNFT && (
          <Modal
            open={showViewModal}
            onClose={() => handleCloseModal()}
            center
            classNames={{ modal: styles.modal }}
            styles={{ modal: { backgroundColor: 'rgba(0, 0, 0, 0.8)', height: 'auto' } }}
            showCloseIcon={false}
          >
            <div className={styles.modalContent} style={{ textAlign: 'center' }}>
              <div className={styles.nftDetails}>
                <h3>{selectedNFT.songName || 'Untitled'}</h3>
                <br />
                <PixelPreview
                  colorMap={selectedNFT.colorMap || []}
                  notesCount={selectedNFT.notesPlayed ? selectedNFT.notesPlayed.length : 0}
                  size={200}
                />
                <br />
                <p>
                  Created by: {selectedNFT.createdBy
                    ? `${selectedNFT.createdBy.slice(0, 6)}...${selectedNFT.createdBy.slice(-4)}`
                    : 'Unknown'}
                </p>
                {/* <p>Notes Played: {selectedNFT.notesPlayed ? selectedNFT.notesPlayed.join(', ') : 'None'}</p> */}
              </div>
              <button className={styles.submitBtn} onClick={handleCloseModal}>Close</button>
            </div>

          </Modal>
        )}

        {/* <Modal
          open={userNFTS.length <= 0}
          onClose={() => {}}
          center
          classNames={{ modal: styles.modal }}
          styles={{ modal: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
          closeOnEsc={false}
          closeOnOverlayClick={false}
          showCloseIcon={false}
        >
          <div className={styles.modalContent}>
            <h2>No NFTs Found</h2>
            <p>You haven't created any NFTs yet. Start creating your own unique NFTs today!</p>
            <br />
            <Link href="/dashboard" className={styles.submitBtn}>Create NFT</Link>
          </div>

        </Modal> */}

        <NeonSlider
          slides={userNFTS.map(nft => ({
            id: nft.id,
            img: nft.img || '/nft1.webp', // fallback image if not present
            songName: nft.songName || '',
            colorMap: nft.colorMap || [],
            notesPlayed: (nft.notesPlayed || []).join(','),
          }))}
        />

        <br />
        <hr />
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

export default GalleryScreen;
