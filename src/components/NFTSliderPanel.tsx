// components/NFTSliderPanel.tsx
import React from 'react';
import CollectionsSlider from './CollectionsSlider';
import styles from '@/app/assets/styles/MainPage.module.css';
import Link from 'next/link';
import NeonSlider from './NeonSlider';
import { TopCollections } from '@/types/topCollections';

const NFTSliderPanel = ({ nfts, collections, loading }: { nfts: any[]; collections: TopCollections[] ; loading: boolean }) => (
  <div>
    <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
      <h2><p className="glitch">My Collection</p></h2>

      {nfts.length <= 0 ? (
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
        <>
          <p>Here you can view all the NFTs you have created.</p>
          <div style={{ marginTop: '-50px', width: '100%' }}>
            <NeonSlider
              slides={nfts.map(nft => ({
                id: nft.id,
                songName: nft.songName || '',
                colorMap: nft.colorMap || [],
                notesPlayed: (nft.notesPlayed || []).join(','),
              }))}
            />
          </div>
        </>
      )}
    </div>
    
    <div className={styles.buttonsContainerMusicBox}>
      <button disabled className={styles.submitBtn} style={{ background: 'transparent', color: 'white', animation: 'none', opacity: '0.5' }}>🪙 Mint</button>
      &nbsp;&nbsp;
      <button disabled className={styles.submitBtn} style={{ background: 'transparent', color: 'white', animation: 'none', opacity: '0.5' }}>🔄 Trade</button>
    </div>
    <CollectionsSlider topCollections={collections} title="Top Fan Collections" />
  </div>
);

export default NFTSliderPanel;
