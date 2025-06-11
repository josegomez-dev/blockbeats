'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '@/app/assets/styles/MainPage.module.css';
import Footer from '@/components/Footer';
import Image from 'next/image';

// --- All Tutorials Definition ---
const tutorials = {
  wallet: [
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
        alert('Opening wallet modal...');
      },
      characterPose: '/avatar/phase-2.webp',
    },
  ],
  drawing: [
    {
      title: '🎨 Create with the Music Drawing Machine',
      message: 'Draw melodies on the grid, add rhythm, and turn your sound into visual art.',
      button: 'Go to App',
      action: () => window.location.href = 'https://blockbeats-tau.vercel.app/',
      characterPose: '/avatar/phase-3.webp',
    },
    {
      title: '🎛️ Advanced Drawing Tips',
      message: 'Learn tips & tricks for creating complex melodies and animations.',
      button: 'Learn Tips',
      action: () => alert('Coming soon!'),
      characterPose: '/avatar/phase-2.webp',
    },
  ],
  nft: [
    {
      title: '🪙 Mint & Share Your NFT',
      message: 'Turn your song into a collectible NFT and share it with the world.',
      button: 'Mint Now',
      action: () => window.location.href = 'https://blockbeats-tau.vercel.app/gallery',
      characterPose: '/avatar/phase-4.webp',
    },
    {
      title: '📢 Promote Your NFT',
      message: 'Best practices to promote your music NFT in the Web3 community.',
      button: 'See Guide',
      action: () => window.open('https://medium.com', '_blank'),
      characterPose: '/avatar/phase-1.webp',
    },
  ],
  community: [
    {
      title: '🤝 Join the BlockBeats Community',
      message: 'Join our Discord and follow us on social media.',
      button: 'Join Discord',
      action: () => window.open('https://discord.gg/hrjuWATX', '_blank'),
      characterPose: '/avatar/phase-3.webp',
    },
    {
      title: '📺 Follow our YouTube Channel',
      message: 'Stay up to date with tutorials and live events.',
      button: 'Go to YouTube',
      action: () => window.open('https://www.youtube.com/@BlockBeats3.0', '_blank'),
      characterPose: '/avatar/phase-2.webp',
    },
  ],
};

// --- List of tutorial types for selection ---
const tutorialTypes = Object.keys(tutorials);

// --- Type for tutorialType state ---
type TutorialType = keyof typeof tutorials;

const TutorialsAndGuidesScreen = () => {
  const searchParams = useSearchParams();

  // State to hold current tutorial type and step
  const [tutorialType, setTutorialType] = useState<TutorialType>('wallet');
  const [step, setStep] = useState<number>(0);

  const tutorialSteps = tutorials[tutorialType];
  const current = tutorialSteps[step];

  // Support URL params: ?tutorial=x&step=y
  useEffect(() => {
    const urlTutorial = searchParams?.get('tutorial');
    const urlStep = parseInt(searchParams?.get('step') || '0', 10);

    if (urlTutorial && tutorials.hasOwnProperty(urlTutorial)) {
      setTutorialType(urlTutorial as TutorialType);
      const stepsLength = tutorials[urlTutorial as TutorialType].length;
      if (!isNaN(urlStep) && urlStep >= 0 && urlStep < stepsLength) {
        setStep(urlStep);
      } else {
        setStep(0);
      }
    }
  }, [searchParams]);

  // Handlers
  const nextStep = () => setStep((prev) => (prev + 1) % tutorialSteps.length);
  const prevStep = () => setStep((prev) => (prev - 1 + tutorialSteps.length) % tutorialSteps.length);
  const selectStep = (index: number) => setStep(index);
  const selectTutorialType = (type: TutorialType) => {
    setTutorialType(type);
    setStep(0); // Reset to first step
  };

  return (
    <>
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h1 className="glitch">📖 Learn How to Use BlockBeats</h1>
        <br />
        <p>Follow your guide and get started with Web3 music creation in just a few steps.</p>
        <br />

        {/* Tutorial Type Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}>
          {tutorialTypes.map((type) => (
            <button
              key={type}
              onClick={() => selectTutorialType(type as TutorialType)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: type === tutorialType ? '#00ffff33' : '#222',
                color: '#fff',
                border: type === tutorialType ? '2px solid #0ff' : '1px solid #555',
                fontSize: '12px',
              }}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Steps Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}>
          {tutorialSteps.map((tut, index) => (
            <button
              key={index}
              onClick={() => selectStep(index)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: index === step ? '#00ffff33' : '#222',
                color: '#fff',
                border: index === step ? '2px solid #0ff' : '1px solid #555',
                fontSize: '12px',
              }}
            >
              {tut.title}
            </button>
          ))}
        </div>

        {/* Tutorial Card */}
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
              style={{ marginBottom: '-2.5rem' }}
            />
          </div>

          <h4 className="glitch">{current.title}</h4>
          <p style={{ color: '#ccc', maxWidth: '500px', margin: '10px auto', fontSize: '12px' }}>{current.message}</p>
          <button onClick={current.action} className={styles.submitBtn} style={{ background: 'transparent', animation: 'none' }}>
            {current.button}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div onClick={prevStep} style={{ cursor: 'pointer' }}>⬅️</div>
            <div onClick={nextStep} style={{ cursor: 'pointer' }}>➡️</div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TutorialsAndGuidesScreen;
