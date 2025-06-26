'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from "@/app/assets/styles/MainPage.module.css";
import PixelPreview from './PixelPreview';
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import { notes } from "@/utils/constants/musicDrawingMachine";
import { NFT } from '@/types/nftTypes';
import DronesShowGame from './DronesShowGame';

interface NeonSliderProps {
  slides: NFT[];
}

const NeonSlider: React.FC<NeonSliderProps> = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopMelodyRef, setStopMelodyRef] = useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = useState<(() => void) | null>(null);
  const [playingSlideId, setPlayingSlideId] = useState<string | number | null>(null);

  const [showDronesGame, setShowDronesGame] = React.useState(false);

  const prevIndex = (current - 1 + slides.length) % slides.length;
  const nextIndex = (current + 1) % slides.length;

  const stopPlayback = () => {
    stopMelodyRef?.();
    stopDrumRef?.();
    setIsPlaying(false);
    setStopMelodyRef(null);
    setStopDrumRef(null);
    setPlayingSlideId(null);
  };

  const handlePrev = () => {
    if (isPlaying) stopPlayback();
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (isPlaying) stopPlayback();
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePlaySlide = (slide: NFT) => {
    if (isPlaying && playingSlideId === slide.id) return;

    stopPlayback();
    setIsPlaying(true);
    setPlayingSlideId(slide.id);

    const melody = (slide.colorMap ?? []).map(({ noteIndex, time }) => ({ noteIndex, time }));
    const tempo = slide.tempo || 300;
    
    const stopDrum = playDrumLoop(tempo, () => {});
    setStopDrumRef(() => stopDrum);

    const stopMelody = playMelody(
      melody,
      tempo,
      notes.map((n) => n[1]),
      () => {
        stopDrum?.();
        setIsPlaying(false);
        setStopMelodyRef(null);
        setStopDrumRef(null);
        setPlayingSlideId(null);
      }
    );

    setStopMelodyRef(() => stopMelody);
  };


  return (
    <>
      {/* Game full-screen overlays */}
      {showDronesGame && (
        <div className={'fullscreen'}>
          <div className={'placeholder'}>
            <h2>🚁 Drones Show - Coming Soon</h2>
            <button onClick={() => setShowDronesGame(false)}>Exit</button>
          </div>
          {/* <DronesGame onClose={() => setShowDronesGame(false)} /> */}
        </div>
      )}

      {showDronesGame && (
        <DronesShowGame
          onClose={() => setShowDronesGame(false)}
          artworks={slides.map(nft => ({
            ...nft,
            title: nft.songName || 'Untitled',
            author: nft.createdBy || 'Unknown',
            colorMap: nft.colorMap ?? [], // Ensure colorMap is always an array
          }))}
        />
      )}

      <div className={styles.sliderContainer}>
        <div className={`${styles.thumbnail} ${styles.leftThumb}`}>
          <PixelPreview
            colorMap={slides[prevIndex]?.colorMap || []}
            notesCount={slides[prevIndex]?.notesPlayed?.length ?? 0}
            size={60}
            backgroundColor={slides[prevIndex]?.color}
          />
        </div>

        <div className={styles.slider}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${
                index === current ? styles.activeSlide : styles.inactiveSlide
              }`}
            >
              <p className='glitch' style={{ color: 'var(--neon-color)'}}>{slide.songName}</p>
              <p style={{ fontSize: '0.8rem' }}>
                <b>Price:</b>{" "}
                <span className="glitch">
                  {Math.floor(Math.random() * 100) / 10}{"Eth"}
                </span>{" "}
                - <span style={{ color: "gold" }}>
                  ${Math.floor(Math.random() * 100) / 10}{"K"}
                </span>
              </p>
              <br />
              <PixelPreview
                colorMap={slide.colorMap || []}
                notesCount={slide.notesPlayed?.length ?? 0}
                size={100}
                backgroundColor={slide.color}
              />

              <button
                onClick={() => handlePlaySlide(slides[current])}
                disabled={isPlaying && playingSlideId === slide.id}
                className={styles.submitBtn}
                style={{ backgroundColor: isPlaying ? "var(--neon-color)" : "transparent", color: 'white',animation: !isPlaying ? "none" : "" }}
              >
                {(isPlaying && playingSlideId === slide.id) ? "🔊" : "▶️ Play"}
              </button>
              <button
                onClick={() => setShowDronesGame(true)}
                disabled={isPlaying && playingSlideId === slide.id}
                className={styles.submitBtn}
                style={{ backgroundColor: isPlaying && playingSlideId === slide.id ? "var(--neon-color)" : "", animation: "none" }}
              >
                🚁 Sky View
              </button>

            </div>
          ))}
        </div>

        <div className={`${styles.thumbnail} ${styles.rightThumb}`}>
          <PixelPreview
            colorMap={slides[nextIndex]?.colorMap || []}
            notesCount={slides[nextIndex]?.notesPlayed?.length ?? 0}
            size={60}
            backgroundColor={slides[nextIndex]?.color}
          />
        </div>

        <div className={styles.sliderControls}>
          <button onClick={handlePrev} className={styles.prevBtn} disabled={isPlaying}>
            &#60;
          </button>
          <button onClick={handleNext} className={styles.nextBtn} disabled={isPlaying}>
            &#62;
          </button>
        </div>
      </div>
    </>
  );
};

export default NeonSlider;
