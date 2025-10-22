'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mintNFT, getOpenSeaUrl, canUserMintNFT } from '@/utils/nftMinting';
import { NFT } from '@/types/nftTypes';
import toast from 'react-hot-toast';
import styles from './MintButton.module.css';

interface MintButtonProps {
  nft: NFT;
  contractAddress?: string;
  tokenId?: string;
  isMinted?: boolean;
}

const MintButton: React.FC<MintButtonProps> = ({ 
  nft, 
  contractAddress, 
  tokenId, 
  isMinted = false 
}) => {
  const { user, walletConnectionAuth } = useAuth();
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState('');

  const userAddress = user?.walletStored || user?.uid;

  const handleMint = async () => {
    if (!userAddress) {
      toast.error('Please connect your wallet to mint NFTs');
      return;
    }

    if (!canUserMintNFT(nft, userAddress || '')) {
      toast.error('You can only mint NFTs that you created');
      return;
    }

    if (!contractAddress) {
      toast.error('Contract address not configured');
      return;
    }

    setIsMinting(true);
    setMintingProgress('Generating image...');

    try {
      setMintingProgress('Uploading to IPFS...');
      
      const result = await mintNFT(nft, userAddress, contractAddress);
      
      if (result.success) {
        toast.success('NFT minted successfully!');
        setMintingProgress('Minting complete!');
        
        // Update the NFT to mark it as minted
        // You might want to update this in your database
        console.log('Minting result:', result);
      } else {
        toast.error(result.error || 'Failed to mint NFT');
        setMintingProgress('Minting failed');
      }
    } catch (error) {
      console.error('Minting error:', error);
      toast.error('An error occurred while minting');
      setMintingProgress('Minting failed');
    } finally {
      setIsMinting(false);
      setTimeout(() => setMintingProgress(''), 3000);
    }
  };

  const handleViewOnOpenSea = () => {
    if (contractAddress && tokenId) {
      const openSeaUrl = getOpenSeaUrl(contractAddress, tokenId);
      window.open(openSeaUrl, '_blank');
    }
  };

  if (isMinted && contractAddress && tokenId) {
    return (
      <button
        className={`${styles.mintButton} ${styles.viewButton}`}
        onClick={handleViewOnOpenSea}
        title="View on OpenSea"
      >
        🌊 View on OpenSea
      </button>
    );
  }

  if (!canUserMintNFT(nft, userAddress || '')) {
    return (
      <button
        className={`${styles.mintButton} ${styles.disabledButton}`}
        disabled
        title="You can only mint NFTs that you created"
      >
        🔒 Not Your NFT
      </button>
    );
  }

  return (
    <div className={styles.mintContainer}>
      <button
        className={`${styles.mintButton} ${isMinting ? styles.mintingButton : ''}`}
        onClick={handleMint}
        disabled={isMinting}
      >
        {isMinting ? '⏳ Minting...' : '🎨 Mint as NFT'}
      </button>
      
      {mintingProgress && (
        <div className={styles.progressText}>
          {mintingProgress}
        </div>
      )}
    </div>
  );
};

export default MintButton;
