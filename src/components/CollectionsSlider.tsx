import React from 'react';
import styles from './../app/assets/styles/MainPage.module.css';
import { TopCollections } from '@/types/topCollections';

interface CollectionProps {
    fullWidth?: boolean;
    title?: string;
    topCollections?: TopCollections[];
}

const CollectionsSlider: React.FC<CollectionProps> = ({ fullWidth, title, topCollections }) => {
  return (
    <div style={{ padding: '25px 50px' }}>
      <h2 className={styles.title}>{title}</h2>
      <br />
      <div className={styles.sliderWrapper} style={{ width: fullWidth ? '100%' : '' }}>
        <div className={styles.sliderTrack}>
          {topCollections && topCollections.map((item, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ borderColor: item.color }}
            >
              <div className={styles.collectionCard}>
                <h3 className={styles.collectionName}>{item.collectionName}</h3>
                <p className={styles.collectionDescription}>{item.collectionDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsSlider;
