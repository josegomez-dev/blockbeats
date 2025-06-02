'use client';
import React, { useRef } from 'react';
import styles from './../app/assets/styles/MainPage.module.css';
import Image from 'next/image';

const merchItems = [
  // {
  //   id: 1,
  //   title: 'BlockBeats T-Shirt',
  //   color: '#00f2ff',
  //   img: '/tshirt.png',
  // },
  {
    id: 2,
    title: 'Signature Mug',
    color: '#00f2ff',
    img: '/merch/_1.png',
  },
  {
    id: 3,
    title: 'Custom MIDI Controller',
    color: '#00f2ff',
    img: '/merch/_2.png',
  },
  {
    id: 4,
    title: 'Neon Cap',
    color: '#00f2ff',
    img: '/merch/_3.png',
  },
  {
    id: 5,
    title: 'Sticker Pack',
    color: '#00f2ff',
    img: '/merch/_4.png',
  },
];

interface MerchSliderProps {
  fullWidth?: boolean;
  title?: string;
}

const MerchSlider: React.FC<MerchSliderProps> = ({ fullWidth, title = "🎁 Merch & Goodies" }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ padding: '10px', textAlign: 'center', width: '100%' }}>
      <h2 className={styles.title}>{title}</h2>
      <br />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button className={styles.submitBtn} style={{marginTop: 50}} onClick={scrollLeft}>⬅</button>
        <div
          ref={sliderRef}
          //className={styles.sliderWrapper}
          style={{
            width: fullWidth ? '100%' : '100%',
            maxWidth: '900px',
            overflowX: 'scroll',
            whiteSpace: 'nowrap',
            scrollBehavior: 'smooth',
          }}
        >
          {[...merchItems, ...merchItems].map((item, i) => (
            <div
              key={i}
              className={styles.card}
              style={{
                display: 'inline-block',
                borderColor: item.color,
                width: '100px',
                height: '120px',
                margin: '0 5px',
                padding: '5px',
                verticalAlign: 'top',
                border: '2px solid',
              }}
            >
              <Image
                src={item.img}
                alt={item.title}
                width={80}
                height={100}
                style={{ objectFit: 'contain', marginBottom: '5px', marginTop: '-10px' }}
              />
              <span style={{ color: item.color, fontSize: '0.55rem', textAlign: 'center', display: 'block', overflowX: 'auto', marginTop: '-25px' }}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
        <button className={styles.submitBtn} style={{ marginTop: 50 }} onClick={scrollRight}>➡</button>
      </div>
    </div>
  );
};

export default MerchSlider;
