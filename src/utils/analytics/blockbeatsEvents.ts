import { useAnalytics } from '@/hooks/useAnalytics';

// BlockBeats-specific analytics events
export const useBlockBeatsAnalytics = () => {
  const { trackEvent, trackUserAction } = useAnalytics();

  const trackMusicCreation = (machineType: 'drawing' | 'drums' | 'voice' | 'launchpad') => {
    trackUserAction('music_created', 'creation', {
      machine_type: machineType,
      timestamp: new Date().toISOString(),
    });
  };

  const trackNFTCreation = (songName: string, machineType: string, tempo: number) => {
    trackUserAction('nft_minted', 'nft', {
      song_name: songName,
      machine_type: machineType,
      tempo,
      timestamp: new Date().toISOString(),
    });
  };

  const trackWalletConnection = (walletType: 'argent' | 'braavos', address: string) => {
    trackUserAction('wallet_connected', 'web3', {
      wallet_type: walletType,
      address_hash: address.slice(0, 6) + '...' + address.slice(-4), // Privacy-safe
      timestamp: new Date().toISOString(),
    });
  };

  const trackCharacterLevelUp = (newLevel: number, previousLevel: number) => {
    trackUserAction('level_up', 'gamification', {
      new_level: newLevel,
      previous_level: previousLevel,
      level_difference: newLevel - previousLevel,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRewardClaimed = (rewardType: 'daily' | 'level_up' | 'achievement', amount: number) => {
    trackUserAction('reward_claimed', 'gamification', {
      reward_type: rewardType,
      amount,
      timestamp: new Date().toISOString(),
    });
  };

  const trackMarketplaceInteraction = (action: 'view' | 'play' | 'trade', nftId: string) => {
    trackUserAction(`marketplace_${action}`, 'marketplace', {
      nft_id: nftId,
      timestamp: new Date().toISOString(),
    });
  };

  const trackCollectionCreated = (collectionName: string, nftCount: number) => {
    trackUserAction('collection_created', 'collections', {
      collection_name: collectionName,
      nft_count: nftCount,
      timestamp: new Date().toISOString(),
    });
  };

  const trackTutorialCompleted = (tutorialType: string, step: number) => {
    trackUserAction('tutorial_completed', 'education', {
      tutorial_type: tutorialType,
      step,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVegasGamePlay = (result: 'win' | 'lose', reward?: number) => {
    trackUserAction('vegas_game_played', 'gamification', {
      result,
      reward: reward || 0,
      timestamp: new Date().toISOString(),
    });
  };

  const trackMIDIConnection = (deviceName: string, connected: boolean) => {
    trackUserAction('midi_connection', 'music', {
      device_name: deviceName,
      connected,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackMusicCreation,
    trackNFTCreation,
    trackWalletConnection,
    trackCharacterLevelUp,
    trackRewardClaimed,
    trackMarketplaceInteraction,
    trackCollectionCreated,
    trackTutorialCompleted,
    trackVegasGamePlay,
    trackMIDIConnection,
  };
};
