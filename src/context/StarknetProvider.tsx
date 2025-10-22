'use client';

import React from 'react';
import { StarknetConfig, publicProvider } from '@starknet-react/core';
import { mainnet } from '@starknet-react/chains';

// Define the chains you want to support - using mainnet only
const chains = [mainnet];

// Create a provider configuration
const provider = publicProvider();

interface StarknetProviderProps {
  children: React.ReactNode;
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      autoConnect={false}
    >
      {children}
    </StarknetConfig>
  );
}
