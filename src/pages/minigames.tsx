'use client';

import React from 'react';
import styles from './../app/assets/styles/MiniGames.module.css'; // Adjust the path as needed
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

const miniGames = [
  {
    title: '🚁 Drones Show',
    description: 'Control a swarm of drones to draw shapes and messages in the air!',
    image: '/games/_1.png',
  },
  {
    title: '🎰 Vegas Mint Machine',
    description: 'Spin the reels and mint your exclusive NFT surprise!',
    image: '/games/_2.png',
  },
  {
    title: '🌆 Smart Light City',
    description: 'Light up buildings and streets in rhythmic patterns.',
    image: '/games/_3.png',
  },
  {
    title: '🪐 Holographic Arena',
    description: 'Enter a 3D hologram space and experience immersive music games!',
    image: '/games/_4.png',
  },
];

const MiniGamesScreen = () => {
  return (
    <>
        <div className={styles.container}>
            <h1 className={`${styles.title} glitch`}>🚀 BlockBeats MiniGames Hub</h1>
            <p className={styles.subtitle}>
                Welcome to the future of music & entertainment. Explore our interactive mini experiences below:
            </p>
            <div className={styles.grid}>
                {miniGames.map((game, index) => (
                <div key={index} className={styles.card}>
                    <img style={{ height: 'auto'}} src={game.image} alt={game.title} className={styles.image} />
                    {/* <div className={styles.content}>
                      <h3 className={styles.cardTitle}>{game.title}</h3>
                      <p className={styles.cardDescription}>{game.description}</p>
                    </div> */}
                </div>
                ))}
            </div>
                  
            <div>
                <br />
                <br />
                <br />
                <br />
                <Image src={'/starknet-logo.svg'} alt={'metamask'} width={200} height={50} style={{ filter: 'invert(1) drop-shadow(0 0 0.3rem #ffffff70)' }} />
                &nbsp;
                &nbsp;
                &nbsp;
                <Link href={'https://josegomez-dev.github.io/MusicalPath/'} target={'_blank'}>
                <Image src={'/musicalpathlogo.webp'} alt={'metamask'} width={100} height={70} style={{ marginBottom: '-5px' }} />
                </Link>
            </div>
        </div>
        <Footer />
    </>
  );
};

export default MiniGamesScreen;
