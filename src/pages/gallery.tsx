import NeonSlider from '@/components/NeonSlider';
import React from 'react';

import styles from "@/app/assets/styles/MainPage.module.css";
import Footer from '@/components/Footer';


const images = [
    '/nft1.png',
    '/nft2.png',
    '/nft3.png',
    '/nft2.png',
    '/nft3.png',
    '/nft1.png',
    '/nft3.png',
    // '/nft2.png',
    // '/nft1.png',
];

const GalleryScreen = () => {
  return (
    <>
      <div className="gallery-screen">
        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
          <br />
          <br />
          <p className="glitch"><h2>My Collection</h2></p>
          <br />
        </div>
        <NeonSlider slides={[
          { id: 1, title: "Starknet Jingle", img: "/nft1.png" },
          { id: 2, title: "Billy Elli2h Collection", img: "/nft2.png" },
          { id: 3, title: "Astrofreakazoid", img: "/nft3.png" },
        ]} />

        <br />

        <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
          <h2><p className="glitch">Gallery of <span data-text="NFTS" className="glitch">NFTS</span></p></h2>
          <br />
        </div>
        <div className="gallery-grid">
          {images.map((src, index) => (
            <div className="gallery-item" key={index}>
              <h3>Title {index + 1}</h3>
              <p>Description for image {index + 1}</p>                
              <div className="gallery-item-overlay">
                  <img src={src} alt={`Gallery ${index}`} className="gallery-image" />
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
