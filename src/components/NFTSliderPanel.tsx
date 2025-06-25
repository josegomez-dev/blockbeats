// components/NFTSliderPanel.tsx
import React from 'react';
import CollectionsSlider from './CollectionsSlider';
import styles from '@/app/assets/styles/MainPage.module.css';
import Link from 'next/link';
import NeonSlider from './NeonSlider';
import { TopCollections } from '@/types/topCollections';

interface NFTSliderPanelProps {
  nfts: any[]; // Array of NFTs, each NFT can have any structure
  collections: TopCollections[]; // Array of top collections, each collection follows the TopCollections
}

const NFTSliderPanel: React.FC<NFTSliderPanelProps> = ({ nfts, collections }) => (
  <div id='core-nft-slider-panel'>
    <div className={styles.bannerContainer} style={{ textAlign: "center", margin: "0 auto" }}>
      <h2>All Creations</h2>

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
                createdBy: nft.createdBy || '',
                createdAt: new Date().toISOString(), // or use nft.createdAt if available
                tempo: nft.tempo, // default tempo or use nft.tempo if available
                color: nft.color || '#000000', // default background color if not present
              }))}
            />
          </div>
        </>
      )}
    </div>
    <CollectionsSlider topCollections={collections} title="Top Fan Collections" />
  </div>
);

export default NFTSliderPanel;
