'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from "@/app/assets/styles/MainPage.module.css";
import PixelPreview from './PixelPreview';
import { playMelody, playDrumLoop } from "@/utils/helpers/drumHelper";
import { notes } from "@/utils/constants/musicDrawingMachine";

interface Slide {
  id: number | string;
  songName: string;
  colorMap: {
    noteIndex: number;
    time: number;
    color: string;
  }[];
  notesPlayed: string;
}

interface NeonSliderProps {
  slides: Slide[];
}

const NeonSlider: React.FC<NeonSliderProps> = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopMelodyRef, setStopMelodyRef] = useState<(() => void) | null>(null);
  const [stopDrumRef, setStopDrumRef] = useState<(() => void) | null>(null);
  const [playingSlideId, setPlayingSlideId] = useState<string | number | null>(null);

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

  const handlePlaySlide = (slide: Slide) => {
    if (isPlaying && playingSlideId === slide.id) return; // already playing this one

    stopPlayback(); // stop anything playing first
    setIsPlaying(true);
    setPlayingSlideId(slide.id);

    const melody = slide.colorMap.map(({ noteIndex, time }) => ({ noteIndex, time }));
    const tempo = 300;

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
    <div className={styles.sliderContainer}>
      <div className={`${styles.thumbnail} ${styles.leftThumb}`}>
        <PixelPreview
          colorMap={slides[prevIndex]?.colorMap}
          notesCount={slides[prevIndex]?.notesPlayed?.length}
          size={60}
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
              notesCount={slide.notesPlayed?.length}
              size={100}
            />

            <button
              onClick={() => handlePlaySlide(slides[current])}
              disabled={isPlaying && playingSlideId === slide.id}
              className={styles.submitBtn}
              style={{ backgroundColor: isPlaying && playingSlideId === slide.id ? "var(--neon-color)" : "transparent" }}
            >
              {(isPlaying && playingSlideId === slide.id) ? "Playing..." : "Play"}
            </button>

          </div>
        ))}
      </div>

      <div className={`${styles.thumbnail} ${styles.rightThumb}`}>
        <PixelPreview
          colorMap={slides[nextIndex]?.colorMap}
          notesCount={slides[nextIndex]?.notesPlayed?.length}
          size={60}
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
  );
};

export default NeonSlider;
