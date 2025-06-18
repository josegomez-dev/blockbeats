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
    <div style={{ padding: '5px 50px' }}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <br />
      <div className={styles.sliderWrapper} style={{ width: fullWidth ? '100%' : '' }}>
        <div className={styles.sliderTrack}>
          {topCollections && topCollections.map((item, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ borderColor: item.color, cursor: 'pointer' }}
              onClick={() => onSelectCollection?.(item.id)}
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
