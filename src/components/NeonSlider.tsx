'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from "@/app/assets/styles/MainPage.module.css";
import PixelPreview from './PixelPreview';

interface Slide {
  id: number | string;
  img: string;
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

  const prevIndex = (current - 1 + slides.length) % slides.length;
  const nextIndex = (current + 1) % slides.length;

  const handlePrev = () => {
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent(prev => (prev + 1) % slides.length);
  };

  // Optional: Auto-slide every 5 seconds
  // useEffect(() => {
  //   const interval = setInterval(handleNext, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const drawPixelArt = (slide: Slide) => {
    // Placeholder for pixel art drawing logic
    return <div className={styles.pixelArt}>{slide.songName}</div>;
  };

  return (
    <div className={styles.sliderContainer}>
      {/* 🚀 Neon Slider */}
  
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
            <p>{slide.songName}</p>
            <br />
            <PixelPreview
              colorMap={slide.colorMap || []}
              notesCount={slide.notesPlayed?.length}
              size={100}
            />
            <br />  
            <p>
              <b>Price:</b>{" "}
              <span data-text="2.1Eth" className="glitch">
                {Math.floor(Math.random() * 100) / 10}{"Eth"}
              </span>{" "}
              - <span style={{ color: "gold" }}>
                ${Math.floor(Math.random() * 100) / 10}{"K"}
                </span>
            </p>
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
        <button onClick={handlePrev} className={styles.prevBtn}>
          &#60;
        </button>
        <button onClick={handleNext} className={styles.nextBtn}>
          &#62;
        </button>
      </div>
    </div>
  );
};

export default NeonSlider;
