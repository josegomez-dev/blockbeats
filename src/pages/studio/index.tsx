import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { FaList, FaMusic, FaPlay, FaHome } from 'react-icons/fa';
import MusicDrawingMachine, { MusicDrawingMachineRef } from '../../components/machines/musicDrawingMachine/MusicDrawingMachine';
import DrumDesigner, { DrumDesignerRef } from '../../components/machines/drumDesigner/DrumDesigner';
import SongManagerModal from '../../components/modals/SongManagerModal';
import { SongData } from '@/utils/helpers/songStorage';
import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

const MusicStudioPage = () => {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  
  // Machine-specific state
  const [showFreqModal, setShowFreqModal] = useState(false);
  
  // Song management state
  const [showSongManager, setShowSongManager] = useState(false);
  
  // Refs for machine communication
  const musicDrawingMachineRef = useRef<MusicDrawingMachineRef>(null);
  const drumDesignerRef = useRef<DrumDesignerRef>(null);

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
  ];

  const renderMachine = () => {
    // Minimal props since machines now have integrated controls
    const machineProps = {
      onFreqModalOpen: () => setShowFreqModal(true)
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
                <button 
                  className={styles.backButton}
                  onClick={handleBackToStudio}
                >
                  <FaHome />
                  Back to Studio
                </button>
                <h3 className={styles.workspaceTitle}>
                  {machines.find(m => m.id === selectedMachine)?.name}
                </h3>
              </div>
              <div className={styles.workspaceContent}>
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

      </div>
    </>
  );
};

export default MusicStudioPage;
