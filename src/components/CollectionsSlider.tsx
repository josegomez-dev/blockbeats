import React from 'react';
import styles from './../app/assets/styles/MainPage.module.css';

const favoriteCollections = [
  { id: 1, title: 'Hype Beast', color: '#00f2ff' },
  { id: 2, title: 'Retro Vinyls', color: '#ff00e0' },
  { id: 3, title: 'Synth Wave Art', color: '#ffff00' },
  { id: 4, title: 'Pixel Legends', color: '#00ff7f' },
  { id: 5, title: 'Glitch Avatars', color: '#ff4500' },
];

interface CollectionProps {
    fullWidth?: boolean;
    title?: string;
}

const CollectionsSlider: React.FC<CollectionProps> = ({ fullWidth, title }) => {
  return (
    <div style={{ padding: '5px' }}>
      <h2 className={styles.title}>{title}</h2>
      <br />
      <div className={styles.sliderWrapper} style={{ width: fullWidth ? '100%' : '' }}>
        <div className={styles.sliderTrack}>
          {[...favoriteCollections, ...favoriteCollections].map((item, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ borderColor: item.color }}
            >
              <span style={{ color: item.color }}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsSlider;
