'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  pageName: string;
}

const SignInUnautorizedModal: React.FC<SignInModalProps> = ({ open, onClose, pageName }) => {
  useEffect(() => {
    if (open) {
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        window.location.href = '/auth/login';
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Fortnite-style Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }}>
        <Image
          src="/images/backgrounds/fortnite-style-preloader-screen.png"
          alt="BlockBeats Background"
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>
      
      {/* Content Overlay */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(0, 255, 195, 0.3)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: '#00ffc3',
          textShadow: '0 0 20px rgba(0, 255, 195, 0.8)',
          fontWeight: 'bold'
        }}>
          🔐 Access Restricted
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          color: '#ccc'
        }}>
          Redirecting to login...
        </p>
        <div style={{
          width: '250px',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
          margin: '0 auto',
          border: '1px solid rgba(0, 255, 195, 0.2)'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #00ffc3, #ff00ff, #00ffc3)',
            backgroundSize: '200% 100%',
            borderRadius: '3px',
            animation: 'progress 3s linear forwards, gradientShift 2s linear infinite'
          }}></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
};

export default SignInUnautorizedModal;
