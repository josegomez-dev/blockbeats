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
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import { notes } from "@/utils/constants/musicDrawingMachine";
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import GalleryHeader from '@/components/GalleryHeader';


const MarketplaceScreen = () => {

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

  const [showViewModal, setShowViewModal] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  const [isPlaying, setIsPlaying] = React.useState(false);
const [playingId, setPlayingId] = React.useState<string | null>(null);
const [stopMelodyRef, setStopMelodyRef] = React.useState<(() => void) | null>(null);
const [stopDrumRef, setStopDrumRef] = React.useState<(() => void) | null>(null);


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
    stopMelodyRef?.();
    stopDrumRef?.();
    setIsPlaying(false);
    setPlayingId(null);
    setShowViewModal(false);
    setSelectedNFT(null);
  };

  const handlePlayNFT = (nft: NFT) => {
  if (!nft.colorMap || nft.colorMap.length === 0) return;

  // Prevent multiple playbacks
  if (isPlaying && playingId === nft.id) return;

  // Stop current playback if any
  stopMelodyRef?.();
  stopDrumRef?.();

  setIsPlaying(true);
  setPlayingId(nft.id);

  const melody = nft.colorMap.map(({ noteIndex, time }) => ({ noteIndex, time }));
  const tempo = 300;

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
      setStopDrumRef(null);
      setStopMelodyRef(null);
    }
  );

  setStopMelodyRef(() => stopMelody);
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

      <div className="gallery-screen" style={{ padding: '15px' }}>
        <div className="gallery-grid">
          {nfts.map((src, index) => (
            <div className="gallery-item" key={index} onClick={() => handleViewNFT(src)}>
              <h3>{src.songName}</h3>
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
                  <button
                    className={styles.submitBtn}
                    //style={{ backgroundColor: isPlaying && playingSlideId === slide.id ? "var(--neon-color)" : "transparent" }}
                    style={{ animation: 'none', background: isPlaying && playingId === src.id ? "var(--neon-color)" : "transparent" }}
                    disabled={isPlaying && playingId === src.id}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the modal
                      handlePlayNFT(src);
                    }}
                  >
                    {(isPlaying && playingId === src.id) ? "Playing..." : "Play"}
                  </button>

              </div>
            </div>
          ))}
          
        </div>
        
      </div>

      {/* <Footer /> */}
    </>
  );
};

export default MarketplaceScreen;
