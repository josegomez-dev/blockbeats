'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from "@/app/assets/styles/MainPage.module.css";

interface Slide {
  id: number | string;
  title: string;
  img: string;
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

  return (
    <div className={styles.sliderContainer}>
      {/* 🚀 Neon Slider */}
      <div className={`${styles.thumbnail} ${styles.leftThumb}`}>
        <Image src={slides[prevIndex].img} alt="prev" width={100} height={100} />
      </div>

      <div className={styles.slider}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${
              index === current ? styles.activeSlide : styles.inactiveSlide
            }`}
          >
            <h3></h3>
            <p>{slide.title}</p>
            <Image src={slide.img} alt={slide.title} width={200} height={200} />
            <p>
              <b>Price:</b>{' '}
              <span data-text="2.1Eth" className="glitch">
                2.1Eth
              </span>{' '}
              - <span style={{ color: 'gold' }}>$98.123k</span>
            </p>
          </div>
        ))}
      </div>

      <div className={`${styles.thumbnail} ${styles.rightThumb}`}>
        <Image src={slides[nextIndex].img} alt="next" width={100} height={100} />
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
