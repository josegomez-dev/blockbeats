import React from 'react';
import toast from 'react-hot-toast';

interface NFTMintingSuccessProps {
  tokenId: string;
  transactionHash?: string;
  contractAddress: string;
  openSeaUrl: string;
  explorerUrl: string;
}

export const showNFTMintingSuccess = ({
  tokenId,
  transactionHash,
  contractAddress,
  openSeaUrl,
  explorerUrl
}: NFTMintingSuccessProps) => {
  toast.success(
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
        🎉 NFT Minted Successfully!
      </div>
      <div style={{ fontSize: '14px', marginBottom: '6px', color: '#ccc' }}>
        Token ID: <span style={{ color: '#4facfe', fontWeight: 'bold' }}>{tokenId}</span>
      </div>
      {transactionHash && (
        <div style={{ fontSize: '14px', marginBottom: '6px', color: '#ccc' }}>
          Transaction: <span style={{ color: '#00d4aa', fontWeight: 'bold' }}>
            {transactionHash.slice(0, 10)}...{transactionHash.slice(-6)}
          </span>
        </div>
      )}
      <div style={{ fontSize: '14px', marginBottom: '12px', color: '#ccc' }}>
        Contract: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>
          {contractAddress.slice(0, 10)}...{contractAddress.slice(-6)}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.open(explorerUrl, '_blank')}
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 172, 254, 0.3)';
          }}
        >
          🔍 View on Explorer
        </button>
        <button
          onClick={() => window.open(openSeaUrl, '_blank')}
          style={{
            background: 'linear-gradient(135deg, #00d4aa 0%, #00a8cc 100%)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0, 212, 170, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 212, 170, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 212, 170, 0.3)';
          }}
        >
          🌊 View on OpenSea
        </button>
      </div>
      <div style={{ 
        fontSize: '12px', 
        marginTop: '8px', 
        color: '#888',
        fontStyle: 'italic'
      }}>
        Your NFT is now live on Starknet! 🚀
      </div>
    </div>,
    {
      duration: 15000, // Show for 15 seconds
      style: {
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '16px',
        padding: '20px',
        maxWidth: '450px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }
    }
  );
};
