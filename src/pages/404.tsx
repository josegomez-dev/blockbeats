'use client';

import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import styles from './404.module.css';

const Custom404 = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Animated Background */}
        <div className={styles.background}>
          <div className={styles.stars}></div>
          <div className={styles.stars2}></div>
          <div className={styles.stars3}></div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Image
              src="/images/logos/logo.webp"
              alt="BlockBeats Logo"
              width={120}
              height={120}
              className={styles.logo}
            />
          </div>

          {/* Error Code */}
          <div className={styles.errorCode}>
            <span className="glitch" data-text="404">404</span>
          </div>

          {/* Error Message */}
          <h1 className={styles.title}>
            <span className="glitch">Oops! Page Not Found</span>
          </h1>
          
          <p className={styles.description}>
            The page you're looking for seems to have vanished into the digital void. 
            Don't worry, even the best musicians hit wrong notes sometimes!
          </p>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button 
              onClick={handleGoBack}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              <span className="glitch">Go Back</span>
            </button>
            
            <Link href="/" className={`${styles.button} ${styles.secondaryButton}`}>
              <span className="glitch">Return Home</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className={styles.navigation}>
            <p className={styles.navTitle}>Or explore these areas:</p>
            <div className={styles.navLinks}>
              <Link href="/studio" className={styles.navLink}>
                🎵 Music Studio
              </Link>
              <Link href="/marketplace" className={styles.navLink}>
                🛒 Marketplace
              </Link>
              <Link href="/collections" className={styles.navLink}>
                🎨 Collections
              </Link>
              <Link href="/dashboard" className={styles.navLink}>
                📊 Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className={styles.floatingElements}>
          <div className={styles.musicNote}>🎵</div>
          <div className={styles.musicNote2}>🎶</div>
          <div className={styles.musicNote3}>🎼</div>
        </div>
      </div>
    </div>
  );
};

export default Custom404;
