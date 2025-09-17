'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '@/app/assets/styles/layouts/MainPage.module.css';
import Footer from '../../components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import GalleryHeader from '../../components/layout/GalleryHeader';
import { useRouter } from 'next/router';

// --- All Tutorials Definition ---
const tutorials = {
  wallet: [
    {
      title: '🌐 What is a Wallet?',
      message: 'A wallet lets you connect securely with Web3 apps. It’s like your digital key to access BlockBeats.',
      button: 'Learn More',
      action: () => window.open('https://ethereum.org/en/wallets/', '_blank'),
      characterPose: '/images/avatars/phase-1.webp',
    },
    {
      title: '🔑 Connect Your Wallet',
      message: 'Use wallets like Argent X or Braavos to sign in and start composing music NFTs. Your creations are yours!',
      button: 'Try It Now',
      action: () => {
        alert('Opening wallet modal...');
      },
      characterPose: '/images/avatars/phase-2.webp',
    },
  ],
  drawing: [
    {
      title: '🎨 Create with the Music Drawing Machine',
      message: 'Draw melodies on the grid, add rhythm, and turn your sound into visual art.',
      button: 'Go to App',
      action: () => window.location.href = 'https://blockbeats-tau.vercel.app/',
      characterPose: '/images/avatars/phase-3.webp',
    },
    {
      title: '🎛️ Advanced Drawing Tips',
      message: 'Learn tips & tricks for creating complex melodies and animations.',
      button: 'Learn Tips',
      action: () => alert('Coming soon!'),
      characterPose: '/images/avatars/phase-2.webp',
    },
  ],
  nft: [
    {
      title: '🪙 Mint & Share Your NFT',
      message: 'Turn your song into a collectible NFT and share it with the world.',
      button: 'Mint Now',
      action: () => window.location.href = 'https://blockbeats-tau.vercel.app/gallery',
      characterPose: '/images/avatars/phase-4.webp',
    },
    {
      title: '📢 Promote Your NFT',
      message: 'Best practices to promote your music NFT in the Web3 community.',
      button: 'See Guide',
      action: () => window.open('https://medium.com', '_blank'),
      characterPose: '/images/avatars/phase-1.webp',
    },
  ],
  community: [
    {
      title: '🤝 Join the BlockBeats Community',
      message: 'Join our Discord and follow us on social media.',
      button: 'Join Discord',
      action: () => window.open('https://discord.gg/hrjuWATX', '_blank'),
      characterPose: '/images/avatars/phase-3.webp',
    },
    {
      title: '📺 Follow our YouTube Channel',
      message: 'Stay up to date with tutorials and live events.',
      button: 'Go to YouTube',
      action: () => window.open('https://www.youtube.com/@BlockBeats3.0', '_blank'),
      characterPose: '/images/avatars/phase-2.webp',
    },
  ],
};

// --- List of tutorial types for selection ---
const tutorialTypes = Object.keys(tutorials);

// --- Type for tutorialType state ---
type TutorialType = keyof typeof tutorials;

const TutorialsAndGuidesScreen = () => {
  const searchParams = useSearchParams();

  const router = useRouter();
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
      <GalleryHeader title="Tutorials & Guides" />       

      <div className='test-tutorials-bg text-center'>
        <br />
        <br />
        <br />
        <br />
        <br />
        <h1><span className='glitch'>How to Use BlockBeats</span></h1>
        <p>Follow your guide and get started with Web3 music creation in just a few steps.</p>
        <br />
        <button onClick={() => router.push('/dashboard/dashboard')} className={`${styles.submitBtn} button-no-animation`}>Create New Musical NFT</button>                    
      </div>
      <br />

      <div className="text-center">

          {/* Tutorial Type Selector */}
        <div className="tutorial-type-selector">
          {tutorialTypes.map((type) => (
            <button
              key={type}
              onClick={() => selectTutorialType(type as TutorialType)}
              className={`tutorial-type-button ${type === tutorialType ? 'active' : ''}`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Steps Selector */}
        <div className="tutorial-type-selector">
          {tutorialSteps.map((tut, index) => (
            <button
              key={index}
              onClick={() => selectStep(index)}
              className={`tutorial-type-button ${index === step ? 'active' : ''}`}
            >
              {tut.title}
            </button>
          ))}
        </div>

        {/* Tutorial Card */}
        <div className="tutorial-card">
          <div className={`${styles.characterContainer} character-float`}>
            <Image
              src={current.characterPose}
              alt="Guide Character"
              width={180}
              height={180}
              className="avatar-container"
            />
          </div>

          <h4 className="glitch">{current.title}</h4>
          <p className="tutorial-message">{current.message}</p>
          <button onClick={current.action} className={`${styles.submitBtn} button-transparent-no-animation`}>
            {current.button}
          </button>

          <div className="tutorial-navigation">
            <div onClick={prevStep} className="tutorial-navigation-item">⬅️</div>
            <div onClick={nextStep} className="tutorial-navigation-item">➡️</div>
          </div>
        </div>
    </div>

      <br />

    </>
  );
};

export default TutorialsAndGuidesScreen;
