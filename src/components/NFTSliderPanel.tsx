// components/NFTSliderPanel.tsx
import React from 'react';
import NeonSlider from './NeonSlider';
import Preloader from './Preloader';
import CollectionsSlider from './CollectionsSlider';
import styles from '@/app/assets/styles/MainPage.module.css';

const NFTSliderPanel = ({ nfts, loading }: { nfts: any[]; loading: boolean }) => (
  <div>
    <br />
    <h2 className={styles.title}>BLOCKBEATS Marketplace</h2>
    <div style={{ marginTop: "-50px" }}>
      {!loading ? (
        nfts.length > 0 ? (
          <NeonSlider slides={nfts} />
        ) : (
          <p>
            <br />
            <br />
            <br />
            Please Register First NFT
          </p>
        )
      ) : (
        <Preloader />
      )}
    </div>
    <div className={styles.buttonsContainerMusicBox}>
      <button disabled className={styles.submitBtn} style={{ background: 'transparent', color: 'white', animation: 'none', opacity: '0.5' }}>🪙 Mint</button>
      &nbsp;&nbsp;
      <button disabled className={styles.submitBtn} style={{ background: 'transparent', color: 'white', animation: 'none', opacity: '0.5' }}>🔄 Trade</button>
    </div>
    <CollectionsSlider title="Top FANS Collections" />
  </div>
);

export default NFTSliderPanel;
