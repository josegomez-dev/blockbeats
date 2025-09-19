'use client';

import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import styles from './error.module.css';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

const CustomError = ({ statusCode, err }: ErrorProps) => {
  const getErrorMessage = () => {
    if (statusCode === 500) {
      return {
        title: 'Internal Server Error',
        description: 'Something went wrong on our end. Our team has been notified and is working to fix it.',
        emoji: '🔧'
      };
    } else if (statusCode === 403) {
      return {
        title: 'Access Forbidden',
        description: 'You don\'t have permission to access this resource.',
        emoji: '🚫'
      };
    } else if (statusCode === 401) {
      return {
        title: 'Unauthorized Access',
        description: 'Please log in to access this page.',
        emoji: '🔐'
      };
    } else {
      return {
        title: 'Something Went Wrong',
        description: 'An unexpected error occurred. Please try again later.',
        emoji: '⚠️'
      };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Animated Background */}
        <div className={styles.background}>
          <div className={styles.circuitPattern}></div>
          <div className={styles.glitchLines}></div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Image
              src="/images/logos/logo.webp"
              alt="BlockBeats Logo"
              width={100}
              height={100}
              className={styles.logo}
            />
          </div>

          {/* Error Icon */}
          <div className={styles.errorIcon}>
            <span className={styles.emoji}>{errorInfo.emoji}</span>
          </div>

          {/* Error Code */}
          {statusCode && (
            <div className={styles.errorCode}>
              <span className="glitch" data-text={statusCode.toString()}>
                {statusCode}
              </span>
            </div>
          )}

          {/* Error Message */}
          <h1 className={styles.title}>
            <span className="glitch">{errorInfo.title}</span>
          </h1>
          
          <p className={styles.description}>
            {errorInfo.description}
          </p>

          {/* Technical Details (only in development) */}
          {process.env.NODE_ENV === 'development' && err && (
            <details className={styles.errorDetails}>
              <summary>Technical Details</summary>
              <pre className={styles.errorStack}>
                {err.message}
                {err.stack}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button 
              onClick={() => window.location.reload()}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              <span className="glitch">Try Again</span>
            </button>
            
            <Link href="/" className={`${styles.button} ${styles.secondaryButton}`}>
              <span className="glitch">Go Home</span>
            </Link>
          </div>

          {/* Help Section */}
          <div className={styles.helpSection}>
            <p className={styles.helpTitle}>Need Help?</p>
            <div className={styles.helpLinks}>
              <Link href="/studio" className={styles.helpLink}>
                🎵 Music Studio
              </Link>
              <Link href="/marketplace" className={styles.helpLink}>
                🛒 Marketplace
              </Link>
              <a href="mailto:support@blockbeats.com" className={styles.helpLink}>
                📧 Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className={styles.floatingElements}>
          <div className={styles.errorSymbol}>⚠️</div>
          <div className={styles.errorSymbol2}>🔧</div>
          <div className={styles.errorSymbol3}>🚫</div>
        </div>
      </div>
    </div>
  );
};

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
