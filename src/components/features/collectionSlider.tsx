import React from 'react';
import styles from '../../app/assets/styles/layouts/MainPage.module.css';
import { TopCollections } from '@/types/topCollections';

interface CollectionProps {
  fullWidth?: boolean;
  title?: string;
  topCollections?: TopCollections[];
  onSelectCollection?: (collectionId: string) => void;
  customSize?: boolean;
  id: string;
}

const CollectionsSlider: React.FC<CollectionProps> = ({ fullWidth, title, topCollections, onSelectCollection, customSize, id }) => {
  return (
    <div id={id} style={{ textAlign: 'left', width: customSize ? '450px' : '100%', marginLeft: customSize ? '-15px' : '' }}>
      {title && <h3 className='glitch box' style={{ marginTop: '10px' }}>{title}</h3>}
      <br />
      {customSize && (<hr/>)}
      <div className={`${styles.sliderWrapper}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
        <div className={styles.sliderTrack}>
          {topCollections && topCollections.map((item, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ borderColor: item.color, cursor: 'pointer', backgroundColor: item.collectionColor  }}
              onClick={() => {
                if (onSelectCollection) {
                  onSelectCollection(item.id);
                } else {
                  window.location.href = `/collections`;
                }                
              }}
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