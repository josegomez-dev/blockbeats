'use client';
import React, { useState } from 'react';
import styles from '@/app/assets/styles/MainPage.module.css'; // or create a new YouTubeSlider.module.css if needed

const youtubeVideos = [
  {
    title: "BlockBeats Hackathon Presentation",
    videoId: "kdBhvrRTCSY", // just the ID
  },
  {
    title: "BlockBeats 3.0 Launch Demo",
    videoId: "0L6S6u_zBss",
  },
  {
    title: "Catarsis Musical – Behind the Scenes",
    videoId: "uHTw4v7J3Fg",
  },
  {
    title: "NFT Music Revolution Talk",
    videoId: "xzJbnkQdRrE",
  },
];

const YouTubeNewsSlider = () => {
  const [current, setCurrent] = useState(0);

  const nextVideo = () => {
    setCurrent((prev) => (prev + 1) % youtubeVideos.length);
  };

  const prevVideo = () => {
    setCurrent((prev) => (prev - 1 + youtubeVideos.length) % youtubeVideos.length);
  };

  return (
    <div style={{ position: 'relative', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '1rem' }}>{youtubeVideos[current].title}</h3>
      
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeVideos[current].videoId}`}
          title={youtubeVideos[current].title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '12px',
          }}
        ></iframe>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button onClick={prevVideo} className={styles.submitBtn}>← Previous</button>
        <button onClick={nextVideo} className={styles.submitBtn}>Next →</button>
      </div>
    </div>
  );
};

export default YouTubeNewsSlider;
