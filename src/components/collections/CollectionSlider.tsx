import React, { useRef, useState } from 'react';
import { TopCollections } from '@/types/topCollections';
import CollectionCard from './CollectionCard';
import styles from './CollectionSlider.module.css';

interface CollectionSliderProps {
  title: string;
  subtitle?: string;
  collections: TopCollections[];
  onCollectionClick: (collectionId: string) => void;
  selectedCollectionId?: string;
  icon?: string;
}

const CollectionSlider: React.FC<CollectionSliderProps> = ({
  title,
  subtitle,
  collections,
  onCollectionClick,
  selectedCollectionId,
  icon = '🎵'
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const scrollAmount = 300;
    const currentScroll = sliderRef.current.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    setIsScrolling(true);
    sliderRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    
    setTimeout(() => setIsScrolling(false), 300);
  };

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderHeader}>
        <div className={styles.sliderTitle}>
          <span className={styles.sliderIcon}>{icon}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.sliderControls}>
          <button 
            className={styles.scrollButton}
            onClick={() => scroll('left')}
            disabled={isScrolling}
          >
            ←
          </button>
          <button 
            className={styles.scrollButton}
            onClick={() => scroll('right')}
            disabled={isScrolling}
          >
            →
          </button>
        </div>
      </div>
      
      <div className={styles.sliderWrapper}>
        <div 
          ref={sliderRef}
          className={styles.slider}
        >
          {collections.map((collection) => (
            <div key={collection.id} className={styles.sliderItem}>
              <CollectionCard
                collection={collection}
                onClick={onCollectionClick}
                isSelected={selectedCollectionId === collection.id}
                isCompact={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionSlider;
