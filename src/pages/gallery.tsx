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

const favoriteCollections = [
  { id: 1, title: 'Hype Beast', color: '#00f2ff' },
  { id: 2, title: 'Retro Vinyls', color: '#ff00e0' },
  { id: 3, title: 'Synth Wave Art', color: '#ffff00' },
  { id: 4, title: 'Pixel Legends', color: '#00ff7f' },
  { id: 5, title: 'Glitch Avatars', color: '#ff4500' },
];

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
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);

  const { user } = useAuth();

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
            styles={{ modal: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}
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

        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
          <h2><p className="glitch">Explore <span data-text="TOP FANS" className="glitch">TOP FANS</span> COLLECTIONS</p></h2>
          <br />
          <p>Discover unique NFTs created by other artists.</p>
          <CollectionsSlider title='' fullWidth />
        </div>

        <br />
        <hr />
        <br />

        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
          <h2><p className="glitch">Blockbeats <span data-text="Marketplace" className="glitch">Marketplace</span></p></h2>
          <br />
        </div>
        <div className="gallery-grid">
          {nfts.map((src, index) => (
            <div className="gallery-item" key={index} onClick={() => handleViewNFT(src)}>
              <h3>{src.songName} {index + 1}</h3>
              <br />
              {/* <p>Description for image {index + 1}</p>                 */}
              <div className="gallery-item-overlay">
                  <PixelPreview
                    colorMap={src.colorMap || []}
                    notesCount={src.notesPlayed ? src.notesPlayed.length : 0}
                    size={100}
                  />
                  {/* <img src={src} alt={`Gallery ${index}`} className="gallery-image" /> */}
                  {/* <button className={styles.submitBtn} style={{ animation: 'none', background: 'transparent' }}>View</button> */}
                  <button className={styles.submitBtn} style={{ animation: 'none' }}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <br />



      <Footer />
    </>
  );
};

export default GalleryScreen;
