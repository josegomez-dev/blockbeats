'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/assets/styles/StoreScreen.module.css';
import GalleryHeader from '@/components/GalleryHeader';
import MusicDrawingPage from '@/components/MusicDrawingMachine';
import CharacterPanel from '@/components/CharacterPanel';

const StoreScreen = () => {
  // Skins carousel
  const skinImages = ['skin-cyberpunk-1.png', 'skin-psy-1.png', 'skin-nature-1.png'];
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Drum kits carousel
  const drumKitImages = ['drumkit-trap.png', 'drumkit-lofi.png', 'drumkit-futurebass.png'];
  const [currentDrumIndex, setCurrentDrumIndex] = useState(0);
  const [isFadingDrum, setIsFadingDrum] = useState(false);

  // Tab selection
  const [selectedTab, setSelectedTab] = useState<'avatar' | 'music'>('avatar');

  // Auto-scroll skin carousel
  useEffect(() => {
    const interval = setInterval(() => handleNext(), 3000);
    return () => clearInterval(interval);
  }, [currentSkinIndex]);

  const handleNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentSkinIndex((prevIndex) =>
        prevIndex === skinImages.length - 1 ? 0 : prevIndex + 1
      );
      setIsFading(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentSkinIndex((prevIndex) =>
        prevIndex === 0 ? skinImages.length - 1 : prevIndex - 1
      );
      setIsFading(false);
    }, 300);
  };

  // Auto-scroll drum kit carousel
  useEffect(() => {
    const interval = setInterval(() => handleNextDrum(), 3000);
    return () => clearInterval(interval);
  }, [currentDrumIndex]);

  const handleNextDrum = () => {
    setIsFadingDrum(true);
    setTimeout(() => {
      setCurrentDrumIndex((prevIndex) =>
        prevIndex === drumKitImages.length - 1 ? 0 : prevIndex + 1
      );
      setIsFadingDrum(false);
    }, 200);
  };

  const handlePrevDrum = () => {
    setIsFadingDrum(true);
    setTimeout(() => {
      setCurrentDrumIndex((prevIndex) =>
        prevIndex === 0 ? drumKitImages.length - 1 : prevIndex - 1
      );
      setIsFadingDrum(false);
    }, 200);
  };

  return (
    <>
      <GalleryHeader title="Explore BlockBeats 3.0 STORE" />
      <div className={styles.storeContainer}>
        <div className={styles.storeContent}>
          {/* Left Panel */}
          <div className={styles.infoPanel}>
            <h2 className="glitch box" style={{ textAlign: 'center' }}>INFORMATION</h2>
            <br />
            <p className={styles.avatarName}>🤖 BEATO</p>
            {/* <p className={styles.description}>Musical AI Unit. Upgradable. Creatively enhanced.</p> */}
            <br />
            <div className={styles.stats}>
              <p>⚡ Energy: 85%</p>
              <p>🎨 Creativity: 91%</p>
              <p>⭐ XP: 640</p>
            </div>
            <br />
            <p>📈 Level: 7</p>
          </div>

          {/* Center Panel with Tabs */}
          <div className={styles.avatarCenter}>
            <br />
            <br />
            {/* Tabs */}
            <div className={styles.tabSelector}>
              <button
                className={`${styles.tabButton} ${selectedTab === 'avatar' ? styles.activeTab : ''}`}
                onClick={() => setSelectedTab('avatar')}
              >
                🤖 BEATO
              </button>
              <button
                className={`${styles.tabButton} ${selectedTab === 'music' ? styles.activeTab : ''}`}
                onClick={() => setSelectedTab('music')}
              >
                🎹 Music Machine
              </button>
            </div>

            {/* Tab Content */}
            {selectedTab === 'avatar' ? (
            <div className={styles.characterPanelWrapper}>
                <CharacterPanel />
            </div>
            ) : (
            <div className={styles.musicMachineContainer}>
                <h2 className='glitch box'>Lauchpad</h2>
                <MusicDrawingPage simple />
            </div>
            )}

          </div>

          {/* Right Panel: Upgrade Carousels */}
          <div className={styles.upgradePanel}>

            {/* Skin Carousel */}
            <h3 className="glitch box" style={{ textAlign: 'center' }}>🤖 Skins</h3>
            <br />
            <div className={`${styles.carouselContainer} box`}>
              <button onClick={handlePrev} className={styles.carouselArrow}>⬅️</button>
              <div
                className={styles.itemCard}
                style={{ opacity: isFading ? 0 : 1, transition: 'opacity 0.3s ease' }}
              >
                <p>{skinImages[currentSkinIndex].replace(/skin-|-\d\.png/, '').replace('-', ' ')} Skin</p>
                <img
                  style={{ width: '100px' }}
                  src={`/store/${skinImages[currentSkinIndex]}`}
                  alt={`Skin ${currentSkinIndex + 1}`}
                />
                <br />
                <button>🤖 300 <span className="glitch">BBC</span></button>
              </div>
              <button onClick={handleNext} className={styles.carouselArrow}>➡️</button>
            </div>

            <hr />
            <br />

            {/* Drum Kit Carousel */}
            <h3 className="glitch box" style={{ textAlign: 'center' }}>🥁 Drum Kits</h3>
            <br />
            <div className={`${styles.carouselContainer} box`}>
              <button onClick={handlePrevDrum} className={styles.carouselArrow}>⬅️</button>
              <div
                className={`${styles.itemCard}`}
                style={{ opacity: isFadingDrum ? 0 : 1, transition: 'opacity 0.3s ease' }}
              >
                <p>{drumKitImages[currentDrumIndex].replace('drums-', '').replace('.webp', '').toUpperCase()} Kit</p>
                <img
                  style={{ width: '100px', height: '100px' }}
                  src={`/store/${drumKitImages[currentDrumIndex]}`}
                  alt={`Drum Kit ${currentDrumIndex + 1}`}
                />
                <br />
                <button>🥁 150 <span className="glitch">BBC</span></button>
              </div>
              <button onClick={handleNextDrum} className={styles.carouselArrow}>➡️</button>
            </div>

            <br />

            {/* Locked or future items */}
            <div className={styles.itemList}>
              <div className={styles.itemCardLocked}>
                <img src="/store/locked-item.webp" />
                <p>Coming Soon</p>
                <button disabled>🔒</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreScreen;
