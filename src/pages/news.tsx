'use client';
import React from 'react';
import styles from '@/app/assets/styles/MainPage.module.css';
import Footer from '@/components/Footer';
import YouTubeNewsSlider from '@/components/YouTubeNewsSlider'; // assume you have or will create this component
import Image from 'next/image';

const NewsAndUpdatesScreen = () => {
  return (
    <>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 className="glitch">📰 News & Updates</h1>
        <p>Stay in the loop with the latest from BlockBeats, Catarsis Musical, and the Web3 music world.</p>
        <Image
            src="/logo.webp"
            alt="News Banner"
            width={150}
            height={150}
            style={{ borderRadius: '12px', marginBottom: '1rem' }}
        />

        <br />
        <hr />
        <br />
        <h2 className="glitch">🎥 Latest News on YouTube</h2>
        <p>Watch interviews, hackathon moments, updates, and future plans:</p>
        <br />
        <a
          href="https://www.youtube.com/playlist?list=PLgMfuGMZ_fu_94LIaTUKwWvd1qZuFua0x"
          target="_blank"
          className={styles.submitBtn}
        >
          ▶️ Watch Full Playlist
        </a>
        <br /><br />
        <YouTubeNewsSlider />
        <br />
        <hr />
        <br />
        <h2 className="glitch">🏆 Highlights & Achievements</h2>
        <p>Celebrating key milestones, awards, and collaborations:</p>
        <ul style={{ textAlign: 'left', margin: 'auto', maxWidth: '600px' }}>
          <li>🥈 2nd Place — Starknet Hackathon with BlockBeats</li>
          <li>🧠 Launch of AI Music Drawing Tool</li>
          <li>🌍 Global Telegram Bot for fans and creators</li>
          <li>🎙️ Presentation with Starknet Foundation</li>
        </ul>

        <br />
        <hr />
        <br />
        <h2 className="glitch">🔔 Get Notified</h2>
        <p>Don’t miss new drops, contests, or features:</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="https://t.me/block_beats_bot/blockbeats" target="_blank" className={styles.submitBtn}>📲 Telegram</a>
          <a href="https://discord.gg/dT4Kb85F" target="_blank" className={styles.submitBtn}>💬 Discord</a>
          <a href="https://www.youtube.com/@catarsismusical" target="_blank" className={styles.submitBtn}>📺 YouTube</a>
        </div>

        <br />
        <hr />
        <br />
        <h2 className="glitch">🛠️ Dev & Feature Roadmap</h2>
        <p>What’s coming next to BlockBeats:</p>
        <ul style={{ textAlign: 'left', margin: 'auto', maxWidth: '600px' }}>
            <br />
          <b style={{ color: 'var(--neon-color)' }}>Beta Version 1.0</b>
          <li>🎛️ Dynamic AI music suggestions</li>
          <li>🎨 Mint & Trade NFT (Starknet (Cairo))</li>
          <li>🌐 Multi-chain support (Other Wallets...)</li>
          <br />
          <b style={{ color: 'var(--neon-color)' }}>Cross-platform NFT sharing</b>
          <li>📈 Advanced analytics for creators</li>
          <li>🕹️ Gameified music quests</li>
          <br />
          <b style={{ color: 'var(--neon-color)' }}>Enhanced NFT minting experience</b>
          <li>🚁 Drones show in the air</li>
          <li>🎰 Vegas-style NFT minting machines</li>
          <li>🌆 Smart lights on streets and buildings</li> 
          <li>🪐 Holographic displays for immersive experiences</li>
        </ul>
        <br />
        <hr />

        <br /><br /><br />
      </div>

      <Footer />
    </>
  );
};

export default NewsAndUpdatesScreen;
