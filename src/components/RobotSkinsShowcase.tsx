import React, { useState } from 'react';
import styles from '@/app/assets/styles/LandingPage.module.css';

interface RobotSkin {
  id: string;
  title: string;
  description: string;
  image: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  category: string;
  price: string;
}

const RobotSkinsShowcase: React.FC = () => {
  const [hoveredSkin, setHoveredSkin] = useState<string | null>(null);

  // Robot skins data
  const robotSkins: RobotSkin[] = [
    {
      id: '1',
      title: 'Cyberpunk Skin',
      description: 'Futuristic neon aesthetic with glowing circuits',
      image: '/store/skins/skin-cyberpunk-1.png',
      rarity: 'legendary',
      category: 'Cyberpunk',
      price: '0.8 ETH'
    },
    {
      id: '2',
      title: 'Nature Skin',
      description: 'Organic design with natural elements and earth tones',
      image: '/store/skins/skin-nature-1.png',
      rarity: 'epic',
      category: 'Nature',
      price: '0.5 ETH'
    },
    {
      id: '3',
      title: 'Psychedelic Skin',
      description: 'Trippy patterns with vibrant colors and cosmic vibes',
      image: '/store/skins/skin-psy-1.png',
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
    <section className={styles.robotSkinsShowcase}>
      <div className={styles.showcaseHeader}>
        <h2>
          <span className="glitch" data-text="🤖 ROBOT SKINS">🤖 ROBOT SKINS</span>
        </h2>
        <p>Customize your BlockBeats robot with epic skins</p>
      </div>

      <div className={styles.skinsGrid}>
        {robotSkins.map((skin, index) => (
          <div
            key={skin.id}
            className={`${styles.skinCard} ${hoveredSkin === skin.id ? styles.skinCardHovered : ''}`}
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
            <div className={styles.skinImageContainer}>
              <img 
                src={skin.image} 
                alt={skin.title}
                className={styles.skinImage}
              />
            </div>

            {/* Skin Info */}
            <div className={styles.skinInfo}>
              <h3 className={styles.skinTitle}>{skin.title}</h3>
              <p className={styles.skinDescription}>{skin.description}</p>
              <div className={styles.skinMeta}>
                <span className={styles.skinCategory}>{skin.category}</span>
                <span className={styles.skinPrice}>{skin.price}</span>
              </div>
            </div>

            {/* Hover Effects */}
            <div className={styles.skinHoverEffects}>
              <div className={styles.skinScanLine}></div>
              <div className={styles.skinCornerGlow}></div>
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
          🛒 View All Skins
        </button>
        <button 
          className={styles.ctaButtonSecondary}
          onClick={() => window.location.href = '/studio'}
        >
          🎨 Create Custom Skin
        </button>
      </div>
    </section>
  );
};

export default RobotSkinsShowcase;
