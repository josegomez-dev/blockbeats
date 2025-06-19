import React from 'react';
import styles from './../app/assets/styles/MainPage.module.css';
import { TopCollections } from '@/types/topCollections';

interface CollectionProps {
  fullWidth?: boolean;
  title?: string;
  topCollections?: TopCollections[];
  onSelectCollection?: (collectionId: string) => void;
}

const CollectionsSlider: React.FC<CollectionProps> = ({ fullWidth, title, topCollections, onSelectCollection }) => {
  return (
    <div style={{ padding: fullWidth ? '15px 85px' : '' }}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <br />
      <div className={styles.sliderWrapper} style={{ width: fullWidth ? '100%' : 'auto' }}>
        <div className={styles.sliderTrack}>
          {topCollections && topCollections.map((item, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ borderColor: item.color, cursor: 'pointer' }}
              onClick={() => onSelectCollection?.(item.id)}
            >
              <div className={styles.collectionCard}>
                <br />
                <h3 className={styles.collectionName}>{item.collectionName}</h3>
                <p className={styles.collectionDescription} style={{ fontSize: '10px', height: '50px' }}>{item.collectionDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsSlider;
