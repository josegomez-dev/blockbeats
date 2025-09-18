import React, { useState } from 'react';
import styles from '@/app/assets/styles/pages/LandingPage.module.css';

interface NFT {
  id: string;
  title: string;
  artist: string;
  price: string;
  image: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  category: string;
}

interface RobotSkin {
  id: string;
  title: string;
  description: string;
  image: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  category: string;
  price: string;
}

const FeaturesGallery: React.FC = () => {
  const [hoveredNFT, setHoveredNFT] = useState<string | null>(null);
  const [hoveredSkin, setHoveredSkin] = useState<string | null>(null);

  // Sample top NFTs data
  const topNFTs: NFT[] = [
    {
      id: '2',
      title: 'Pixel Dreams',
      artist: 'RetroWave',
      price: '0.3 ETH',
      image: '/images/store/drumkit/lofi.png',
      rarity: 'epic',
      category: 'Lo-Fi'
    },
    {
      id: '3',
      title: 'Neon Pulse',
      artist: 'SynthMaster',
      price: '0.4 ETH',
      image: '/images/store/drumkit/synth-pixel.png',
      rarity: 'rare',
      category: 'Synthwave'
    },
    {
      id: '4',
      title: 'Digital Storm',
      artist: 'CyberCore',
      price: '0.2 ETH',
      image: '/images/store/drumkit/trap.png',
      rarity: 'rare',
      category: 'Trap'
    },
    {
      id: '5',
      title: 'Voice Machine',
      artist: 'VocalAI',
      price: '0.6 ETH',
      image: '/images/store/drumkit/voicemusicmachine.png',
      rarity: 'legendary',
      category: 'Vocal'
    }
  ];

  // Robot skins data
  const robotSkins: RobotSkin[] = [
    {
      id: '1',
      title: 'Cyberpunk Skin',
      description: 'Futuristic neon aesthetic with glowing circuits',
      image: '/images/store/skins/skin-cyberpunk-1.png',
      rarity: 'legendary',
      category: 'Cyberpunk',
      price: '0.8 ETH'
    },
    {
      id: '2',
      title: 'Nature Skin',
      description: 'Organic design with natural elements and earth tones',
      image: '/images/store/skins/skin-nature-1.png',
      rarity: 'epic',
      category: 'Nature',
      price: '0.5 ETH'
    },
    {
      id: '3',
      title: 'Psychedelic Skin',
      description: 'Trippy patterns with vibrant colors and cosmic vibes',
      image: '/images/store/skins/skin-psy-1.png',
      rarity: 'rare',
      category: 'Psychedelic',
      price: '0.3 ETH'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9D4EDD';
      case 'rare': return '#00B4D8';
      case 'common': return '#6C757D';
      default: return '#6C757D';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '0 0 20px #FFD700, 0 0 40px #FFD700';
      case 'epic': return '0 0 20px #9D4EDD, 0 0 40px #9D4EDD';
      case 'rare': return '0 0 20px #00B4D8, 0 0 40px #00B4D8';
      case 'common': return '0 0 10px #6C757D';
      default: return '0 0 10px #6C757D';
    }
  };

  return (
    <section className={styles.featuresGallery}>
      {/* Launchpad Machines Section */}
      <div className={styles.gallerySection}>
        <div className={styles.sectionHeader}>
          <h2>
            <span className="glitch" data-text="🎵 LAUNCHPAD MACHINES">🎵 LAUNCHPAD MACHINES</span>
          </h2>
          <p>Discover the most epic musical NFTs in the metaverse</p>
        </div>

        <div className={styles.galleryGrid}>
          {topNFTs.map((nft, index) => (
            <div
              key={nft.id}
              className={`${styles.galleryCard} ${hoveredNFT === nft.id ? styles.galleryCardHovered : ''}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                borderColor: getRarityColor(nft.rarity),
                boxShadow: hoveredNFT === nft.id ? getRarityGlow(nft.rarity) : 'none'
              }}
              onMouseEnter={() => setHoveredNFT(nft.id)}
              onMouseLeave={() => setHoveredNFT(null)}
            >
              {/* Rarity Badge */}
              <div 
                className={styles.rarityBadge}
                style={{ 
                  backgroundColor: getRarityColor(nft.rarity),
                  boxShadow: getRarityGlow(nft.rarity)
                }}
              >
                {nft.rarity.toUpperCase()}
              </div>

              {/* NFT Image */}
              <div className={styles.cardImageContainer}>
                <img 
                  src={nft.image} 
                  alt={nft.title}
                  className={styles.cardImage}
                />
              </div>

              {/* NFT Info */}
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{nft.title}</h3>
                <p className={styles.cardArtist}>by {nft.artist}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.cardCategory}>{nft.category}</span>
                  <span className={styles.cardPrice}>{nft.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.sectionCTA}>
          <button 
            className={styles.ctaButton}
            onClick={() => window.location.href = '/marketplace'}
          >
            🚀 Explore All NFTs
          </button>
          <button 
            className={styles.ctaButtonSecondary}
            onClick={() => window.location.href = '/studio'}
          >
            🎹 Create Your Own
          </button>
        </div>
      </div>

      {/* Robot Skins Section */}
      <div className={styles.gallerySection}>
        <div className={styles.sectionHeader}>
          <h2>
            <span className="glitch" data-text="🤖 ROBOT SKINS">🤖 ROBOT SKINS</span>
          </h2>
          <p>Customize your BlockBeats robot with epic skins</p>
        </div>

        <div className={styles.galleryGrid}>
          {robotSkins.map((skin, index) => (
            <div
              key={skin.id}
              className={`${styles.galleryCard} ${hoveredSkin === skin.id ? styles.galleryCardHovered : ''}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                borderColor: getRarityColor(skin.rarity),
                boxShadow: hoveredSkin === skin.id ? getRarityGlow(skin.rarity) : 'none'
              }}
              onMouseEnter={() => setHoveredSkin(skin.id)}
              onMouseLeave={() => setHoveredSkin(null)}
            >
              {/* Rarity Badge */}
              <div 
                className={styles.rarityBadge}
                style={{ 
                  backgroundColor: getRarityColor(skin.rarity),
                  boxShadow: getRarityGlow(skin.rarity)
                }}
              >
                {skin.rarity.toUpperCase()}
              </div>

              {/* Skin Image */}
              <div className={styles.cardImageContainer}>
                <img 
                  src={skin.image} 
                  alt={skin.title}
                  className={styles.cardImage}
                />
              </div>

              {/* Skin Info */}
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{skin.title}</h3>
                <p className={styles.cardDescription}>{skin.description}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.cardCategory}>{skin.category}</span>
                  <span className={styles.cardPrice}>{skin.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.sectionCTA}>
          <button 
            className={styles.ctaButton}
            onClick={() => window.location.href = '/marketplace'}
          >
            🛒 View All Skins
          </button>
          <button 
            className={styles.ctaButtonSecondary}
            onClick={() => window.location.href = '/studio'}
          >
            🎨 Create Custom Skin
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGallery;
