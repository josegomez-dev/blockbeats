'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAccount } from '@starknet-react/core';
import { 
  mintNFT, 
  getOpenSeaUrl, 
  canUserMintNFT, 
  generateImageFromPixelData,
  uploadImageToIPFS,
  createNFTMetadata,
  uploadMetadataToIPFS
} from '@/utils/nftMinting';
import { useMintNFT } from '@/utils/starknetContract';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { NFT } from '@/types/nftTypes';
import toast from 'react-hot-toast';
import styles from './MintButton.module.css';
import { showNFTMintingSuccess } from './NFTMintingNotification';

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
  const { address: starknetAddress, isConnected } = useAccount();
  const { mintNFT: mintNFTOnChain, isConnected: isWalletConnected } = useMintNFT();
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState('');

  const userAddress = user?.walletStored || user?.uid;

  const handleMint = async () => {
    // Check wallet connection first
    if (!isConnected || !starknetAddress) {
      toast.error('Please connect your Starknet wallet to mint NFTs');
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
      // Step 1: Generate image and upload to IPFS
      setMintingProgress('Generating image...');
      const imageResult = await generateImageFromPixelData(
        nft.colorMap || [],
        nft.color || '#000',
        512
      );
      
      setMintingProgress('Uploading image to IPFS...');
      const imageUrl = await uploadImageToIPFS(imageResult, `nft-${nft.id}-image.png`);
      
      // Step 2: Create and upload metadata
      setMintingProgress('Creating metadata...');
      const metadata = createNFTMetadata(nft, imageUrl);
      const metadataUrl = await uploadMetadataToIPFS(metadata);
      
      // Step 3: Generate token ID
      const tokenId = Math.floor(Math.random() * 1000000).toString();
      
      // Step 4: Mint on blockchain
      setMintingProgress('Minting on blockchain...');
      const blockchainResult = await mintNFTOnChain(
        contractAddress,
        tokenId,
        metadataUrl
      );
      
      if (blockchainResult.success) {
        // Create URLs for the minted NFT
        const explorerUrl = `https://starknet.io/explorer/contract/${contractAddress}`;
        const openSeaUrl = getOpenSeaUrl(contractAddress, tokenId);
        
        // Show detailed success notification with links
        showNFTMintingSuccess({
          tokenId,
          transactionHash: blockchainResult.transactionHash,
          contractAddress,
          openSeaUrl,
          explorerUrl
        });
        
        setMintingProgress('Minting complete!');
        
        // Update database with minting info
        try {
          const nftRef = doc(db, 'signatures', nft.id);
          await updateDoc(nftRef, {
            tokenId,
            contractAddress,
            isMinted: true,
            mintedAt: new Date().toISOString(),
            mintedBy: starknetAddress,
            ipfsImageUrl: imageUrl,
            ipfsMetadataUrl: metadataUrl,
            transactionHash: blockchainResult.transactionHash
          });
        } catch (dbError) {
          console.error('Database update failed:', dbError);
        }
        
        console.log('Minting result:', blockchainResult);
      } else {
        toast.error(blockchainResult.error || 'Failed to mint NFT on blockchain');
        setMintingProgress('Blockchain minting failed');
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

  const handleViewInWallet = () => {
    if (contractAddress && tokenId) {
      // Open Starknet explorer for the specific token
      const explorerUrl = `https://starknet.io/explorer/contract/${contractAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const handleViewTokenOnExplorer = () => {
    if (contractAddress && tokenId) {
      // Open Starknet explorer for the specific token
      const explorerUrl = `https://starknet.io/explorer/contract/${contractAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (isMinted && contractAddress && tokenId) {
    return (
      <div className={styles.mintedButtons}>
        <button
          className={`${styles.mintButton} ${styles.viewButton}`}
          onClick={handleViewInWallet}
          title="View in Starknet Explorer"
        >
          🔍 View in Explorer
        </button>
        <button
          className={`${styles.mintButton} ${styles.openSeaButton}`}
          onClick={handleViewOnOpenSea}
          title="View on OpenSea"
        >
          🌊 View on OpenSea
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        className={`${styles.mintButton} ${styles.disabledButton}`}
        disabled
        title="Connect your Starknet wallet to mint NFTs"
      >
        🔌 Connect Wallet
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
