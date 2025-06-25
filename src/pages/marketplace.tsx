import React, { useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PixelPreview from '@/components/PixelPreview';
import { Modal } from "react-responsive-modal";
import SignInUnautorizedModal from '@/components/SignInUnautorizedModal';
import GalleryHeader from '@/components/GalleryHeader';
import { NFT } from '@/types/nftTypes';

const MarketplaceScreen = () => {

  const [nfts, setNFTs] = React.useState<NFT[]>([]);

  const [showViewModal, setShowViewModal] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ ...(doc.data() as NFT), id: doc.id })) as NFT[];
      setNFTs(nfts);
    };
    fetchNFTs();
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

  const handleViewNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowViewModal(true);
  };
  
  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedNFT(null);
  };

  return (
    <>
      <GalleryHeader title="Explore the Marketplace" />

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
              <PixelPreview
                colorMap={selectedNFT.colorMap || []}
                notesCount={selectedNFT.notesPlayed ? selectedNFT.notesPlayed.length : 0}
                size={200}
                backgroundColor={selectedNFT.color || '#000'}
              />
              <br />
              <p>
                Created by: {selectedNFT.createdBy
                  ? `${selectedNFT.createdBy.slice(0, 6)}...${selectedNFT.createdBy.slice(-4)}`
                  : 'Unknown'}
              </p>
            </div>
            <button className={styles.submitBtn} onClick={handleCloseModal}>Close</button>
          </div>

        </Modal>
      )}

      <div className="gallery-screen" style={{ padding: '15px' }}>
        <div className="gallery-grid">
          {nfts.map((src, index) => (
            <div className="gallery-item" key={index} onClick={() => handleViewNFT(src)}>
              <h4
                style={{
                  whiteSpace: "nowrap",         // keeps text in one line
                  overflow: "hidden",           // hides the overflow
                  textOverflow: "ellipsis",     // adds the "..." at the end
                  fontSize: "16px",             // or whatever size you want
                  maxWidth: "100%",             // ensure it doesn't overflow container
                  marginBottom: "10px",         // space between title and image
                }}
              >
                {src.songName}
              </h4>
              <div className="gallery-item-overlay">
                  <PixelPreview
                    colorMap={src.colorMap || []}
                    notesCount={src.notesPlayed ? src.notesPlayed.length : 0}
                    size={100}
                    backgroundColor={src.color || '#000'}
                  />
                  <button className={styles.submitBtn} style={{ animation: 'none' }}>View</button>
              </div>
            </div>
          ))}          
        </div>
      </div>
    </>
  );
};

export default MarketplaceScreen;
