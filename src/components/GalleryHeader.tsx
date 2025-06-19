'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

type GalleryHeaderProps = {
  title?: string;
};

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ title = 'Explore My Gallery.' }) => {
  return (
    <>
      <div
        style={{
          backdropFilter: 'blur(50px)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          position: 'relative',
          padding: '20px 0',
        }}
      >
        <Link href="/dashboard" style={{ position: 'absolute', top: 25, right: 15 }}>
          <FaArrowLeft style={{ marginRight: 10 }} />
        </Link>
        <div style={{ textAlign: 'center', margin: '0 auto', marginBottom: '-5px' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '500' }}>{title}</p>
        </div>
      </div>
      <hr />
    </>
  );
};

export default GalleryHeader;
