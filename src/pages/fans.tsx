'use client';
import React from 'react';
import styles from '@/app/assets/styles/MainPage.module.css';
import Footer from '@/components/Footer';
import Link from 'next/link';
import MerchSliderPanel from '@/components/MerchSliderPanel';

const FansClub = () => {
  return (
    <>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 className="glitch">🎉 Welcome to the FANS Club</h1>
        <p>Join our global community of music lovers & creators. Be part of the revolution with BlockBeats & Catarsis Musical!</p>

        <br />
        <h2 className="glitch">🎯 Join the Community</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          <a href="https://t.me/blockbeatsbot" target="_blank" className={styles.submitBtn}>🤖 Join Telegram Bot</a>
          <a href="https://discord.gg/blockbeats" target="_blank" className={styles.submitBtn}>💬 Join Discord Server</a>
          <a href="https://facebook.com/catarsismusical" target="_blank" className={styles.submitBtn}>📘 Visit Facebook Page</a>
        </div>

        <br />
        <h2 className="glitch">📢 Stay Updated</h2>
        <p>Follow our official news channel and never miss an update from <b>Catarsis Musical</b> and check <b>BlockBeats NEWS</b> playslist:</p>
        <br />
        <a href="https://t.me/catarsismusical" target="_blank" className={styles.submitBtn}>📡 JOIN Catarsis Musical CHANNEL</a>

        {/* <br />
        <br />
        <br />
        <h2 className="glitch">❤️ Support the Project</h2>
        <p>If you love what we're building and want to help us grow, you can support us on Patreon!</p>
        <br />
        <a href="https://www.patreon.com/c/josegomez" target="_blank" className={styles.submitBtn}>🌟 Support on Patreon</a> */}

        <br />
        <br />
        <br />
        <h2 className="glitch">🛍️ Merchandising</h2>
        <p>Wear the beat, drink the vibe, and play the rhythm:</p>

        <MerchSliderPanel />
        <br />
        <a href="https://blockbeats-tau.vercel.app/gallery" target="_blank" className={styles.submitBtn}>🛒 Visit Merch Store</a>

        <br />
        <br />
        <br />
        <br />
        <h2 className="glitch">🌟 Be Featured as a Top Fan</h2>
        <p>Want to be on our spotlight wall? Start creating and sharing your NFTs on BlockBeats. Engage with our community and collect your fan points!</p>
        <br />
        <a href="https://blockbeats-tau.vercel.app/" className={styles.submitBtn}>🚀 Launch the App</a>
        <br />
        <br />
        <br />

      </div>

      <Footer />
    </>
  );
};

export default FansClub;
