import NeonSlider from '@/components/NeonSlider';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from '@/components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PixelPreview from '@/components/PixelPreview';


const images = [
    '/nft1.webp',
    '/nft2.webp',
    '/nft3.webp',
    '/nft2.webp',
    '/nft3.webp',
    '/nft1.webp',
    '/nft3.webp',
    // '/nft2.png',
    // '/nft1.png',
];


const GalleryScreen = () => {

  const [nfts, setNFTs] = React.useState<any[]>([]);
  const [userNFTS, setUserNFTS] = React.useState<any[]>([]);
  const { user } = useAuth();



  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNFTs(nfts);
      console.log("NFTs fetched:", nfts);
      userNFTS.filter(item => item.createdBy === user.uid)
    };
    fetchNFTs();
  }, []);

  return (
    <>
      <div className="gallery-screen">
        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
          <br />
          <br />
          <h2><p className="glitch">My Collection</p></h2>
        </div>
        
        {user && (
          userNFTS.length > 0 ? (
            <NeonSlider slides={userNFTS} />
          ) : (
            <div>
              <h4 className='reg-p'>You haven't created any BB yet :-(</h4>
                <Link href="/dashboard">
                  <button className={styles.launchpadBtn}>💾 Create your first Blockbeat</button>
                </Link>
            </div>
          )
        )}

        <br />

        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
          <h2><p className="glitch">Blockbeats <span data-text="NFTS" className="glitch">Marketplace</span></p></h2>
          <br />
        </div>
        <div className="gallery-grid">
          {nfts.map((src, index) => (
            <div className="gallery-item" key={index}>
              <h3>{src.songName} {index + 1}</h3>
              <br />
              {/* <p>Description for image {index + 1}</p>                 */}
              <div className="gallery-item-overlay">
                  <PixelPreview
                    colorMap={src.colorMap || []}
                    notesCount={src.notesPlayed?.length}
                    size={100}
                  />
                  <br />
                  {/* <img src={src} alt={`Gallery ${index}`} className="gallery-image" /> */}
                  <button className={styles.submitBtn} style={{ animation: 'none', background: 'transparent' }}>View</button>
                  &nbsp;
                  &nbsp;
                  <button className={styles.submitBtn} style={{ animation: 'none' }}>Buy</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GalleryScreen;
