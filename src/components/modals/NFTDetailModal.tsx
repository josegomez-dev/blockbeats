'use client';

import React, { useState } from 'react';
import { NFT } from '@/types/nftTypes';
import PixelPreview from '../machines/PixelPreview';
import { FaTimes, FaPlay, FaPause, FaDownload, FaShare } from 'react-icons/fa';

interface NFTDetailModalProps {
  nft: NFT | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: (nft: NFT) => void;
  isPlaying?: boolean;
}

const NFTDetailModal: React.FC<NFTDetailModalProps> = ({
  nft,
  isOpen,
  onClose,
  onPlay,
  isPlaying = false
}) => {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  if (!isOpen || !nft) return null;

  const formatDuration = (tempo?: number) => {
    if (!tempo) return '2:30';
    const duration = Math.floor(120 / (tempo / 60));
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMachineTypeIcon = (machineType?: string) => {
    const icons = {
      drawing: '🎨',
      drums: '🥁',
      voicemusic: '🎤',
      launchpad: '🎛️'
    };
    return icons[machineType as keyof typeof icons] || '🎵';
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay(nft);
    }
  };

  const handleDownload = () => {
    // Create a JSON file with the NFT data
    const nftData = {
      ...nft,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(nftData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nft.songName || 'untitled'}.blockbeats.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft.songName || 'BlockBeats NFT',
          text: `Check out this musical NFT: ${nft.songName || 'Untitled'}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '2px solid rgba(0, 255, 195, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.2rem'
          }}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            color: '#00ffc3',
            fontSize: '2rem',
            marginBottom: '0.5rem',
            textShadow: '0 0 10px rgba(0, 255, 195, 0.5)'
          }}>
            {nft.songName || 'Untitled'}
          </h2>
          <p style={{
            color: '#ccc',
            fontSize: '1rem',
            margin: 0
          }}>
            {getMachineTypeIcon(nft.machineType)} {nft.machineType || 'Unknown'} • {formatDuration(nft.tempo)}
          </p>
        </div>

        {/* Visual Preview */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            border: '3px solid rgba(0, 255, 195, 0.3)',
            borderRadius: '15px',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.3)'
          }}>
            <PixelPreview
              colorMap={nft.colorMap || []}
              size={200}
              backgroundColor={nft.color || '#000'}
            />
            {isPreviewPlaying && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '3rem',
                color: '#00ffc3',
                textShadow: '0 0 20px rgba(0, 255, 195, 0.8)',
                animation: 'pulse 1s infinite'
              }}>
                🎵
              </div>
            )}
          </div>
        </div>

        {/* NFT Details */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            color: '#00ffc3',
            fontSize: '1.3rem',
            marginBottom: '1rem'
          }}>
            Details
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            fontSize: '0.9rem'
          }}>
            <div>
              <strong style={{ color: '#fff' }}>Tempo:</strong>
              <span style={{ color: '#ccc', marginLeft: '0.5rem' }}>
                {nft.tempo || 'Unknown'} BPM
              </span>
            </div>
            
            <div>
              <strong style={{ color: '#fff' }}>Machine Type:</strong>
              <span style={{ color: '#ccc', marginLeft: '0.5rem' }}>
                {nft.machineType || 'Unknown'}
              </span>
            </div>
            
            <div>
              <strong style={{ color: '#fff' }}>Melody Notes:</strong>
              <span style={{ color: '#ccc', marginLeft: '0.5rem' }}>
                {nft.colorMap?.length || 0}
              </span>
            </div>
            
            <div>
              <strong style={{ color: '#fff' }}>Created:</strong>
              <span style={{ color: '#ccc', marginLeft: '0.5rem' }}>
                {nft.createdAt ? new Date(nft.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>

          {nft.isCollaborative && nft.authors && (
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ color: '#fff' }}>Collaborative:</strong>
              <span style={{ color: '#ccc', marginLeft: '0.5rem' }}>
                🎵 {nft.authors.length} author(s)
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handlePlay}
            style={{
              background: isPlaying ? '#ff4444' : '#00ffc3',
              color: '#000',
              border: 'none',
              borderRadius: '25px',
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: isPlaying ? '0 0 20px rgba(255, 68, 68, 0.5)' : '0 0 20px rgba(0, 255, 195, 0.5)'
            }}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={handleDownload}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <FaDownload />
            Download
          </button>

          <button
            onClick={handleShare}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <FaShare />
            Share
          </button>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default NFTDetailModal;
