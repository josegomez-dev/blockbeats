import React, { useState, useEffect } from 'react';
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

const TopNFTShowcase: React.FC = () => {
  const [hoveredNFT, setHoveredNFT] = useState<string | null>(null);

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
    <section className={styles.topNFTShowcase}>
      <div className={styles.showcaseHeader}>
        <h2>
          <span className="glitch" data-text="🎵 LAUNCHPAD MACHINES">🎵 LAUNCHPAD MACHINES</span>
        </h2>
        <p>Discover the most epic musical NFTs in the metaverse</p>
      </div>

      <div className={styles.nftGrid}>
        {topNFTs.map((nft, index) => (
          <div
            key={nft.id}
            className={`${styles.nftCard} ${hoveredNFT === nft.id ? styles.nftCardHovered : ''}`}
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
            <div className={styles.nftImageContainer}>
              <img 
                src={nft.image} 
                alt={nft.title}
                className={styles.nftImage}
              />
            </div>

            {/* NFT Info */}
            <div className={styles.nftInfo}>
              <h3 className={styles.nftTitle}>{nft.title}</h3>
              <p className={styles.nftArtist}>by {nft.artist}</p>
              <div className={styles.nftMeta}>
                <span className={styles.nftCategory}>{nft.category}</span>
                <span className={styles.nftPrice}>{nft.price}</span>
              </div>
            </div>

            {/* Hover Effects */}
            <div className={styles.nftHoverEffects}>
              <div className={styles.scanLine}></div>
              <div className={styles.cornerGlow}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className={styles.showcaseCTA}>
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
    </section>
  );
};

export default TopNFTShowcase;
