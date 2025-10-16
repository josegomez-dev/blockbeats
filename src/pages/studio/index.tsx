import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { FaList, FaMusic, FaPlay, FaHome, FaSave } from 'react-icons/fa';
import MusicDrawingMachine, { MusicDrawingMachineRef } from '../../components/machines/musicDrawingMachine/MusicDrawingMachine';
import DrumDesigner, { DrumDesignerRef } from '../../components/machines/drumDesigner/DrumDesigner';
import SongManagerModal from '../../components/modals/SongManagerModal';
import SaveSongModal from '../../components/modals/SaveSongModal';
import { SongData } from '@/utils/helpers/songStorage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

const MusicStudioPage = () => {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  
  // Machine-specific state
  const [showFreqModal, setShowFreqModal] = useState(false);
  
  // Song management state
  const [showSongManager, setShowSongManager] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loadingSong, setLoadingSong] = useState(false);
  const [saveModalSongData, setSaveModalSongData] = useState<SongData | null>(null);
  
  
  // Refs for machine communication
  const musicDrawingMachineRef = useRef<MusicDrawingMachineRef>(null);
  const drumDesignerRef = useRef<DrumDesignerRef>(null);
  
  // Audio ref for studio background music
  const studioAudioRef = useRef<HTMLAudioElement>(null);
  
  // Router and auth
  const router = useRouter();
  const { user } = useAuth();

  // Safe JSON parsing function
  const safeJsonParse = (jsonString: any) => {
    try {
      // If it's already an object, return it
      if (typeof jsonString === 'object' && jsonString !== null) {
        return jsonString;
      }
      // If it's a string, try to parse it
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      // If it's anything else, return null
      return null;
    } catch (error) {
      console.warn('Failed to parse JSON:', jsonString, error);
      return null;
    }
  };

  // Load song from URL parameter
  useEffect(() => {
    const loadSongFromUrl = async () => {
      const { loadSong } = router.query;
      if (loadSong && typeof loadSong === 'string') {
        await loadSongById(loadSong);
      }
    };

    if (router.isReady) {
      loadSongFromUrl();
    }
  }, [router.isReady, router.query]);

  // Handle studio background music
  useEffect(() => {
    const audio = studioAudioRef.current;
    if (!audio) return;

    // Play studio music when on machine selection screen
    if (!selectedMachine) {
      audio.play().catch((error) => {
        console.log('Auto-play prevented:', error);
        // Auto-play was prevented, user will need to interact first
      });
    } else {
      // Pause studio music when a machine is selected
      audio.pause();
      audio.currentTime = 0;
    }

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [selectedMachine]);

  const machines = [
    {
      id: 'drawing',
      name: 'Music Drawing Machine',
      description: 'Compose 8Bit melodies as pixel-art with MIDI compatibility',
      video: '/images/avatars/phase-3.mp4',
      ready: true,
      color: '#00ffff',
      category: 'Synthesizer'
    },
    {
      id: 'drums',
      name: 'Drums Designer Machine',
      description: 'Create custom drum patterns with a grid interface',
      video: '/images/avatars/phase-4.mp4',
      ready: true,
      color: '#ff6b6b',
      category: 'Drum Machine'
    },
    {
      id: 'voicemusic',
      name: 'Voice Music Machine',
      description: 'Generate melodies with your voice using AI',
      ready: false,
      color: '#4ecdc4',
      category: 'AI Voice'
    },
    {
      id: 'launchpad',
      name: 'Launchpad Machine',
      description: 'Trigger samples and loops with a grid interface',
      ready: false,
      color: '#45b7d1',
      category: 'Sampler'
    },
    {
      id: 'lofi',
      name: 'LoFi Beats Machine',
      description: 'Create chill lo-fi hip hop beats with vintage vibes and vinyl crackle',
      ready: false,
      color: '#ff9f43',
      category: 'LoFi Producer'
    },
    {
      id: 'web3sounds',
      name: 'Web3 Sounds Machine',
      description: 'Generate ambient sounds and sound effects for Web3 apps and games',
      ready: false,
      color: '#6c5ce7',
      category: 'Web3 Audio'
    },
    {
      id: 'rapperbeats',
      name: 'Rapper Beats Machine',
      description: 'Craft hard-hitting beats and instrumentals for rap and hip-hop artists',
      ready: false,
      color: '#fd79a8',
      category: 'Hip-Hop Producer'
    },
    {
      id: 'ambient',
      name: 'Ambient Soundscape Machine',
      description: 'Generate atmospheric ambient music and soundscapes for meditation',
      ready: false,
      color: '#00cec9',
      category: 'Ambient Creator'
    },
  ];

  const renderMachine = () => {
    // Minimal props since machines now have integrated controls
    const machineProps = {
      onFreqModalOpen: () => setShowFreqModal(true),
      // Disable machine updates when save modal or creations modal is open
      isPaused: showSaveModal
    };

    switch (selectedMachine) {
      case 'drawing':
        return <MusicDrawingMachine {...machineProps} ref={musicDrawingMachineRef} />;
      case 'drums':
        return <DrumDesigner {...machineProps} ref={drumDesignerRef} />;
      default:
        return null;
    }
  };

  const handleBackToStudio = () => {
    setSelectedMachine(null);
  };


  const collectCurrentSongData = (): SongData => {
    const drawingData = musicDrawingMachineRef.current?.getData();
    const drumData = drumDesignerRef.current?.getData();
    
    return {
      id: `song_${Date.now()}`,
      name: 'Untitled Song',
      createdAt: new Date(),
      updatedAt: new Date(),
      tempo: 120, // Default tempo
      steps: 32,  // Default steps
      volume: 80, // Default volume
      drawingMachine: drawingData ? {
        notesPlayed: drawingData.notesPlayed,
        colorMap: drawingData.colorMap,
        selectedRange: drawingData.selectedRange,
        isDrumEnabled: drawingData.isDrumEnabled
      } : undefined,
      drumMachine: drumData ? {
        grid: drumData.grid,
        selectedSounds: drumData.selectedSounds,
        currentStep: 0
      } : undefined
    };
  };

  const loadSongById = async (songId: string) => {
    if (!user) {
      toast.error('You must be logged in to load songs');
      return;
    }

    try {
      setLoadingSong(true);
      const songDoc = await getDoc(doc(db, 'signatures', songId));
      
      if (!songDoc.exists()) {
        toast.error('Song not found');
        return;
      }

      const songData = songDoc.data();
      
      // Check if user owns this song
      if (songData.createdBy !== user.uid) {
        toast.error('You can only edit your own songs');
        return;
      }

      // Set the appropriate machine
      if (songData.machineType === 'drawing') {
        setSelectedMachine('drawing');
        // Note: loadData method not implemented yet
      } else if (songData.machineType === 'drums') {
        setSelectedMachine('drums');
        // Note: loadData method not implemented yet
      }

      toast.success(`Loaded "${songData.name}"`);
    } catch (error) {
      console.error('Error loading song:', error);
      toast.error('Failed to load song');
    } finally {
      setLoadingSong(false);
    }
  };

  const handleLoadSong = (songData: SongData) => {
    // Load song data into machines
    if (songData.drawingMachine) {
      console.log('Loading drawing machine data:', songData.drawingMachine);
      // TODO: Implement loading logic for drawing machine
    }
    
    if (songData.drumMachine) {
      console.log('Loading drum machine data:', songData.drumMachine);
      // TODO: Implement loading logic for drum machine
    }
  };







  return (
    <>
      <Head>
        <title>BlockBeats Studio - Professional Music Creation Suite</title>
        <meta name="description" content="Create professional music NFTs with BlockBeats Studio. Advanced music creation tools with MIDI support, AI assistance, and Web3 integration." />
        <meta name="keywords" content="BlockBeats studio, music creation, drawing machine, drum designer, MIDI, music composition, pixel music, music NFTs, Web3 music studio, professional DAW" />
        <meta property="og:title" content="BlockBeats Studio - Professional Music Creation Suite" />
        <meta property="og:description" content="Create professional music NFTs with BlockBeats Studio. Advanced music creation tools with MIDI support, AI assistance, and Web3 integration." />
        <meta property="og:image" content="https://blockbeats-tau.vercel.app/images/logos/logo.webp" />
        <meta property="og:url" content="https://blockbeats-tau.vercel.app/studio" />
      </Head>

      {/* Studio Background Audio */}
      <audio
        ref={studioAudioRef}
        src="/sounds/app/studio.mp3"
        loop
        preload="auto"
      />

      <div className={styles.studioContainer}>
        <br />

        {/* Main Studio Content */}
        <div className={styles.studioContent}>
          {!selectedMachine ? (
            <div className={styles.machineSelection}>
              <div className={styles.selectionHeader}>
                <h2 className={styles.selectionTitle}>
                  🎛️ Choose Your <span className="glitch" data-text="Music Machine">Music Machine</span>
                </h2>
                <p className={styles.selectionSubtitle}>
                  Select a professional music creation tool to start composing
                </p>
              </div>

              <div className={styles.machinesGrid}>
                {machines.map((machine) => (
                  <div
                    key={machine.id}
                    className={`${styles.machineCard} ${!machine.ready ? styles.notReady : ''}`}
                    onClick={() => machine.ready && setSelectedMachine(machine.id)}
                    style={{ '--machine-color': machine.color } as React.CSSProperties}
                  >
                    {/* Video Background */}
                    {machine.video && (
                      <video
                        className={styles.machineVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                      >
                        <source src={machine.video} type="video/mp4" />
                      </video>
                    )}
                    
                    {/* Video Overlay */}
                    <div className={styles.videoOverlay}></div>
                    
                    <div className={styles.machineInfo}>
                      <div className={styles.machineCategory}>{machine.category}</div>
                      <h3 className={styles.machineName}>{machine.name}</h3>
                      <p className={styles.machineDescription}>{machine.description}</p>
                    </div>

                    {!machine.ready && (
                      <div className={styles.comingSoon}>
                        <span>Coming Soon</span>
                      </div>
                    )}

                    <div className={styles.machineHover}>
                      <FaPlay className={styles.playIcon} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>2</span>
                  <span className={styles.statLabel}>Active Machines</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>∞</span>
                  <span className={styles.statLabel}>Creative Possibilities</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>Comming Soon</span>
                  <span className={styles.statLabel}>Web3 on-chain storage</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.machineWorkspace}>
              <div className={styles.workspaceHeader}>
                <div className={styles.headerButtons}>
                  <button 
                    className={styles.backButton}
                    onClick={handleBackToStudio}
                  >
                    <FaHome />
                    Back to Studio
                  </button>
                  <button 
                    className={styles.saveButton}
                    onClick={() => {
                      // Collect song data once when opening the modal
                      const currentSongData = collectCurrentSongData();
                      setSaveModalSongData(currentSongData);
                      setShowSaveModal(true);
                    }}
                  >
                    <FaSave />
                    Save Song
                  </button>
                </div>
                <h3 className={styles.workspaceTitle}>
                  {machines.find(m => m.id === selectedMachine)?.name}
                </h3>
              </div>
              <div className={styles.workspaceContent}>
                {/* Loading Indicator */}
                {loadingSong && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading song...</p>
                  </div>
                )}

                {/* Save Modal Overlay - Prevents interaction with machine */}
                {showSaveModal && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modalOverlayMessage}>
                      <FaSave className={styles.modalOverlayIcon} />
                      <p>Save your musical NFT</p>
                    </div>
                  </div>
                )}

                {/* Video Background for Drums Designer Machine */}
                {selectedMachine === 'drums' && (
                  <>
                    <video
                      className={styles.machineVideoBackground}
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="/images/avatars/phase-4.mp4" type="video/mp4" />
                    </video>
                    
                    {/* Video Overlay */}
                    <div className={styles.videoOverlay}></div>
                  </>
                )}
                
                {renderMachine()}
              </div>
            </div>
          )}
        </div>

        {/* Song Manager Modal */}
        <SongManagerModal
          isOpen={showSongManager}
          onClose={() => setShowSongManager(false)}
          onLoadSong={handleLoadSong}
          currentSongData={collectCurrentSongData()}
        />

        {/* Save Song Modal */}
        <SaveSongModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setSaveModalSongData(null);
          }}
          songData={saveModalSongData || collectCurrentSongData()}
          onSaveSuccess={() => {
            // Refresh any data if needed
            console.log('Song saved successfully!');
            setSaveModalSongData(null);
          }}
        />


      </div>
    </>
  );
};

export default MusicStudioPage;
