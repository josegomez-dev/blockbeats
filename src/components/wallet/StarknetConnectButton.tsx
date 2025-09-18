'use client';

import React, { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useStarkProfile,
} from '@starknet-react/core';
import { toast } from 'react-hot-toast';
import styles from '@/app/assets/styles/layouts/MainPage.module.css';

interface StarknetConnectButtonProps {
  onConnect?: (address: string, profile?: any) => void;
  onDisconnect?: () => void;
}

const StarknetConnectButton: React.FC<StarknetConnectButtonProps> = ({
  onConnect,
  onDisconnect,
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: profile, isLoading: profileLoading } = useStarkProfile({ 
    address: address || undefined 
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const getWalletButtonStyle = (connectorName: string, isConnecting: boolean) => {
    const baseStyle = {
      width: '100%',
      maxWidth: '400px',
      opacity: isConnecting ? 0.7 : 1,
      cursor: isConnecting ? 'not-allowed' : 'pointer',
      marginBottom: '10px',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)',
      '&:hover': {
        transform: isConnecting ? 'translateY(0)' : 'translateY(-2px)',
      }
    };

    // Determine colors based on wallet type
    if (connectorName.toLowerCase().includes('braavos')) {
      return {
        ...baseStyle,
        background: isConnecting 
          ? 'linear-gradient(45deg, #b8860b, #daa520)' 
          : 'linear-gradient(45deg, #ffd700, #ffed4e)',
        color: '#000',
        border: '2px solid #ffd700',
        boxShadow: isConnecting ? 'none' : '0 0 20px rgba(255, 215, 0, 0.3)',
        fontWeight: 'bold'
      };
    } else if (connectorName.toLowerCase().includes('argent')) {
      return {
        ...baseStyle,
        background: isConnecting 
          ? 'linear-gradient(45deg, #cc5500, #ff6600)' 
          : 'linear-gradient(45deg, #ff6600, #ff8533)',
        color: '#fff',
        border: '2px solid #ff6600',
        boxShadow: isConnecting ? 'none' : '0 0 20px rgba(255, 102, 0, 0.3)',
        fontWeight: 'bold'
      };
    } else {
      // Default style for other wallets
      return {
        ...baseStyle,
        background: isConnecting 
          ? 'linear-gradient(45deg, #666, #999)' 
          : 'linear-gradient(45deg, #00ffff, #ff00ff)',
        color: '#fff',
        border: '2px solid #00ffff',
        boxShadow: isConnecting ? 'none' : '0 0 20px rgba(0, 255, 255, 0.3)',
        fontWeight: 'bold'
      };
    }
  };

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true);
      await connect({ connector });
      toast.success('Wallet connected successfully!');
      
      // Call the onConnect callback with address and profile
      if (onConnect && address) {
        onConnect(address, profile);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
      
      // Call the onDisconnect callback
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  if (!isConnected) {
    return (
      <div className="wallet-button-container">
        <div className="wallet-connectors">
          {connectors.map((connector) => {
            if (connector.available()) {
              return (
                <button
                  key={connector.id}
                  className={styles.submitBtnLarge}
                  onClick={() => handleConnect(connector)}
                  disabled={isConnecting}
                  style={getWalletButtonStyle(connector.name, isConnecting)}
                >
                  <span className="wallet-button-text">
                    {isConnecting ? 'Connecting...' : `Connect ${connector.name}`}
                  </span>
                  <img 
                    src="/images/logos/starknet-logo.svg" 
                    className="wallet-logo" 
                    alt="starknet-logo" 
                    width={60} 
                  />
                </button>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-button-container">
      <button
        className={styles.submitBtnLarge}
        onClick={handleDisconnect}
        style={{
          background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
          color: '#fff',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '15px 20px',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="wallet-info">
          <div className="wallet-name">
            {profileLoading ? (
              'Loading...'
            ) : (
              profile?.name || `${address?.slice(0, 6)}...${address?.slice(-4)}`
            )}
          </div>
          {profile?.profilePicture && (
            <img
              src={profile.profilePicture}
              alt="Profile"
              width="32"
              height="32"
              className="wallet-profile-picture"
              style={{
                borderRadius: '50%',
                marginLeft: '10px'
              }}
            />
          )}
        </div>
        <div className="wallet-status">
          <span>Disconnect</span>
        </div>
      </button>
    </div>
  );
};

export default StarknetConnectButton;
