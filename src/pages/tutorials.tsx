'use client';
import React, { useState } from 'react';
import styles from '@/app/assets/styles/MainPage.module.css';
import Footer from '@/components/Footer';
import Image from 'next/image';

const tutorialSteps = [
  {
    title: '🌐 What is a Wallet?',
    message: 'A wallet lets you connect securely with Web3 apps. It’s like your digital key to access BlockBeats.',
    button: 'Learn More',
    action: () => window.open('https://ethereum.org/en/wallets/', '_blank'),
    characterPose: '/avatar/phase-1.webp',
  },
  {
    title: '🔑 Connect Your Wallet',
    message: 'Use wallets like Argent X or Braavos to sign in and start composing music NFTs. Your creations are yours!',
    button: 'Try It Now',
    action: () => {
      // Replace with your wallet connect logic
      alert('Opening wallet modal...');
    },
    characterPose: '/avatar/phase-2.webp',
  },
  {
    title: '🎨 Create with the Music Drawing Machine',
    message: 'Draw melodies on the grid, add rhythm, and turn your sound into visual art.',
    button: 'Go to App',
    action: () => window.location.href = 'https://blockbeats-tau.vercel.app/',
    characterPose: '/avatar/phase-3.webp',
  },
  {
    title: '🪙 Mint & Share Your NFT',
    message: 'Turn your song into a collectible NFT and share it with the world. Join the music revolution!',
    button: 'Mint Now',
    action: () => window.location.href = 'https://blockbeats-tau.vercel.app/gallery',
    characterPose: '/avatar/phase-4.webp',
  },
];

const TutorialsAndGuidesScreen = () => {
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];

  const nextStep = () => setStep((prev) => (prev + 1) % tutorialSteps.length);
  const prevStep = () => setStep((prev) => (prev - 1 + tutorialSteps.length) % tutorialSteps.length);

  return (
    <>
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h1 className="glitch">📖 Learn How to Use BlockBeats</h1>
        <p>Follow your guide and get started with Web3 music creation in just a few steps.</p>
        <br />

        <div
          style={{
            position: 'relative',
            background: '#111',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 0 30px rgba(0,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <div className={styles.characterContainer} style={{ animation: 'float 2s ease-in-out infinite' }}>
            <Image
              src={current.characterPose}
              alt="Guide Character"
              width={180}
              height={180}
              style={{ marginBottom: '1rem' }}
            />
          </div>

          <h2 className="glitch">{current.title}</h2>
          <p style={{ color: '#ccc', maxWidth: '500px', margin: '1rem auto' }}>{current.message}</p>
          <button onClick={current.action} className={styles.submitBtn}>
            {current.button}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={prevStep} className={styles.submitBtn}>⬅️ Back</button>
            <button onClick={nextStep} className={styles.submitBtn}>Next ➡️</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TutorialsAndGuidesScreen;
