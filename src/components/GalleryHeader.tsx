'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { on } from 'events';

type GalleryHeaderProps = {
  title?: string;
  onBackClick?: () => void;
};

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ title = 'Explore My Gallery.', onBackClick }) => {
  return (
    <>
      <div
        style={{
          backdropFilter: 'blur(50px)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          position: 'fixed',
          width: '100%',
          padding: '25px 0 20px',
        }}
      >
        {onBackClick ? (
          <div onClick={onBackClick} style={{ position: 'absolute', top: 30, right: 15, cursor: 'pointer' }}>
            <FaArrowLeft style={{ marginRight: 10 }} />
          </div>) : (
          <Link href="/dashboard" style={{ position: 'absolute', top: 30, right: 15, cursor: 'pointer' }}>
            <FaArrowLeft style={{ marginRight: 10 }} />
          </Link>)}
        <div style={{ textAlign: 'center', margin: '0 auto', marginBottom: '-5px' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '500' }}>{title}</p>
        </div>
      </div>
      <hr />
    </>
  );
};

export default GalleryHeader;
