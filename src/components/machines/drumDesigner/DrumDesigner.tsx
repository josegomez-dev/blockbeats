'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styles from '@/app/assets/styles/components/DrumDesigner.module.css';
import TransportControls from './TransportControls';
import PatternControls from './PatternControls';
import DrumSequencer from './DrumSequencer';
import DrumGrid from './DrumGrid';
import SoundSidebar from './SoundSidebar';
import PremiumRowModal from './PremiumRowModal';
import CustomSoundModal from './CustomSoundModal';
import { BACKING_TRACKS, DRUM_SOUNDS } from '../../../utils/constants/drumMachine';
import { playSound } from '../../../utils/helpers/audioHelper';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const MIN_STEPS = 4;
const MAX_STEPS = 32;
const MAX_INSTRUMENTS = 5;
const INITIAL_INSTRUMENTS = 4;

const MAX_FREE_ROWS = 7; // 4 default + 3 more allowed
const PREMIUM_LOCK_THRESHOLD = MAX_FREE_ROWS;
const SINGLE_ROW_PRICE = 500; // BBC coins for 1 row
const TRIPLE_ROW_PRICE = 800; // BBC coins for 3 rows

interface CustomSound {
  id: string;
  name: string;
  file: File;
  url: string;
  duration?: number;
}


interface DrumDesignerProps {
  isPlaying?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
  steps?: number;
  onStepsChange?: (steps: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  currentTime?: string;
  setCurrentTime?: (time: string) => void;
}

export interface DrumDesignerRef {
  play: () => void;
  stop: () => void;
  reset: () => void;
  getData: () => {
    grid: boolean[][];
    selectedSounds: string[];
  };
}

const DrumDesigner = forwardRef<DrumDesignerRef, DrumDesignerProps>(({
  isPlaying: externalIsPlaying,
  onPlay,
  onStop,
  tempo: externalTempo,
  onTempoChange,
  steps: externalSteps,
  onStepsChange,
  volume: externalVolume,
  onVolumeChange,
  currentTime: externalCurrentTime,
  setCurrentTime
}, ref) => {
  const [grid, setGrid] = useState<boolean[][]>(
    Array(INITIAL_INSTRUMENTS).fill(null).map(() => Array(8).fill(false))
  );
  const [selectedSounds, setSelectedSounds] = useState<string[]>([
    DRUM_SOUNDS.find((s) => s.type === 'kick')?.name || '',
    DRUM_SOUNDS.find((s) => s.type === 'snare')?.name || '',
    DRUM_SOUNDS.find((s) => s.type === 'sfx')?.name || '',
    DRUM_SOUNDS.find((s) => s.type === 'hihat')?.name || '',
  ]);

  const [expandedDropdown, setExpandedDropdown] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [backingTrack, setBackingTrack] = useState('');
  const [soundFilter, setSoundFilter] = useState<string>('all');
  const [isSoundSidebarOpen, setIsSoundSidebarOpen] = useState(false);
  const [selectedRowForSound, setSelectedRowForSound] = useState<number | null>(null);
  const [previewedSound, setPreviewedSound] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumModalAction, setPremiumModalAction] = useState<'single' | 'triple' | null>(null);
  const [isCustomSoundModalOpen, setIsCustomSoundModalOpen] = useState(false);
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  
  // Auth context for BBC coins
  const { user, updateCoinsInFirestore } = useAuth();
  
  // Internal state for tempo and steps
  const [internalTempo, setInternalTempo] = useState(120);
  const [internalSteps, setInternalSteps] = useState(8);
  const [internalVolume, setInternalVolume] = useState(80); // Default volume at 80%
  const [timeSignature, setTimeSignature] = useState({ beats: 4, noteValue: 4 }); // 4/4 by default
  
  // Internal state for independent operation
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  
  // Use external props or fallback to internal state
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const tempo = externalTempo !== undefined ? externalTempo : internalTempo;
  const steps = externalSteps !== undefined ? externalSteps : internalSteps;
  const volume = externalVolume !== undefined ? externalVolume : internalVolume;


  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Internal functions for integrated controls
  const startPlayback = () => {
    if (onPlay) {
      onPlay();
    } else {
      setInternalIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (onStop) {
      onStop();
    } else {
      setInternalIsPlaying(false);
    }
  };

  const reset = () => {
    setGrid(Array(INITIAL_INSTRUMENTS).fill(null).map(() => Array(steps).fill(false)));
    setCurrentStep(0);
    if (onStop) {
      onStop();
    } else {
      setInternalIsPlaying(false);
    }
  };

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    play: startPlayback,
    stop: stopPlayback,
    reset: reset,
    getData: () => ({
      grid,
      selectedSounds
    })
  }), [grid, selectedSounds]);

  // Initialize audio elements for sound preview
  useEffect(() => {
    DRUM_SOUNDS.forEach((sound) => {
      if (!audioRefs.current[sound.name]) {
        const audio = new Audio(sound.url);
        audio.preload = 'auto';
        audio.volume = volume / 100;
        
        // Add error handling
        audio.addEventListener('error', (e) => {
          console.error(`Failed to load audio: ${sound.name}`, e);
        });
        
        audioRefs.current[sound.name] = audio;
      } else {
        // Update volume for existing audio elements
        audioRefs.current[sound.name].volume = volume / 100;
      }
    });
  }, [volume]);

  const toggleCell = (row: number, step: number) => {
    const updated = grid.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === step ? !c : c)) : r
    );
    setGrid(updated);
  };

  const addInstrumentRow = () => {
    if (grid.length >= MAX_INSTRUMENTS) return;
    setGrid((prev) => [...prev, Array(steps).fill(false)]);
    setSelectedSounds((prev) => [...prev, DRUM_SOUNDS[0].name]);
  };

  const unlockSingleRow = async () => {
    if (!user || (user.bbcPoints || 0) < SINGLE_ROW_PRICE) {
      toast.error('Insufficient BBC coins!');
      return;
    }

    if (grid.length >= MAX_INSTRUMENTS) {
      toast.error('Maximum instruments reached!');
      return;
    }

    try {
      // Deduct coins
      await updateCoinsInFirestore(-SINGLE_ROW_PRICE, 'Unlocked 1 premium drum row');
      
      // Add the row
      setGrid((prev) => [...prev, Array(steps).fill(false)]);
      setSelectedSounds((prev) => [...prev, DRUM_SOUNDS[0].name]);
      
      closePremiumModal();
      toast.success('Premium row unlocked! 🥁');
    } catch (error) {
      console.error('Error unlocking row:', error);
      toast.error('Failed to unlock row. Please try again.');
    }
  };

  const unlockTripleRows = async () => {
    if (!user || (user.bbcPoints || 0) < TRIPLE_ROW_PRICE) {
      toast.error('Insufficient BBC coins!');
      return;
    }

    const rowsToAdd = Math.min(3, MAX_INSTRUMENTS - grid.length);
    if (rowsToAdd <= 0) {
      toast.error('Maximum instruments reached!');
      return;
    }

    try {
      // Deduct coins
      await updateCoinsInFirestore(-TRIPLE_ROW_PRICE, `Unlocked ${rowsToAdd} premium drum rows`);
      
      // Add the rows
      const newRows = Array(rowsToAdd).fill(null).map(() => Array(steps).fill(false));
      const newSounds = Array(rowsToAdd).fill(DRUM_SOUNDS[0].name);
      
      setGrid((prev) => [...prev, ...newRows]);
      setSelectedSounds((prev) => [...prev, ...newSounds]);
      
      closePremiumModal();
      toast.success(`${rowsToAdd} premium rows unlocked! 🥁🥁🥁`);
    } catch (error) {
      console.error('Error unlocking rows:', error);
      toast.error('Failed to unlock rows. Please try again.');
    }
  };

  const openPremiumModal = (action: 'single' | 'triple') => {
    setPremiumModalAction(action);
    setIsPremiumModalOpen(true);
  };

  const closePremiumModal = () => {
    setIsPremiumModalOpen(false);
    setPremiumModalAction(null);
  };

  const addCustomSound = (sound: CustomSound) => {
    setCustomSounds(prev => [...prev, sound]);
    toast.success(`Custom sound "${sound.name}" added! 🎵`);
  };

  const removeCustomSound = (id: string) => {
    setCustomSounds(prev => {
      const sound = prev.find(s => s.id === id);
      if (sound) {
        URL.revokeObjectURL(sound.url); // Clean up memory
        toast.success(`Custom sound "${sound.name}" removed! 🗑️`);
      }
      return prev.filter(s => s.id !== id);
    });
  };

  const selectCustomSound = (sound: CustomSound) => {
    if (selectedRowForSound !== null) {
      // Add custom sound to the available sounds for this row
      setSelectedSounds(prev => {
        const newSounds = [...prev];
        newSounds[selectedRowForSound] = sound.name;
        return newSounds;
      });
      
      // Create audio element for the custom sound
      if (!audioRefs.current[sound.name]) {
        const audio = new Audio(sound.url);
        audio.preload = 'auto';
        audio.volume = volume / 100;
        audioRefs.current[sound.name] = audio;
      }
      
      setIsCustomSoundModalOpen(false);
      toast.success(`Custom sound "${sound.name}" assigned to row ${selectedRowForSound + 1}! 🥁`);
    }
  };

  const getTypeOfSelected = (rowIndex: number) => {
    const selectedName = selectedSounds[rowIndex];
    return DRUM_SOUNDS.find((s) => s.name === selectedName)?.type;
  };

  const changeSteps = (newSteps: number) => {
    setInternalSteps(newSteps); // Update internal state
    onStepsChange?.(newSteps); // Call external handler if provided
    setGrid((prev) =>
      prev.map((row) => {
        if (newSteps > row.length) {
          return row.concat(Array(newSteps - row.length).fill(false));
        } else {
          return row.slice(0, newSteps);
        }
      })
    );
  };

  const changeTempo = (newTempo: number) => {
    setInternalTempo(newTempo); // Update internal state
    onTempoChange?.(newTempo); // Call external handler if provided
  };

  const selectSoundForRow = (soundName: string) => {
    if (selectedRowForSound !== null) {
      const updated = [...selectedSounds];
      updated[selectedRowForSound] = soundName;
      setSelectedSounds(updated);
      setSelectedRowForSound(null);
      setPreviewedSound(null);
      setIsSoundSidebarOpen(false);
      // Close dropdown if it was open
      setExpandedDropdown(null);
    }
  };

  const handleSoundPreview = (soundName: string) => {
    setPreviewedSound(soundName);
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume / 100;
      playSound(audio);
    }
  };

  const closeSidebar = () => {
    setIsSoundSidebarOpen(false);
    setSelectedRowForSound(null);
    setPreviewedSound(null);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const getRecommendedFilterForRow = (rowIndex: number): string => {
    // Row 0 -> kick, Row 1 -> snare, Row 2 -> fx, Row 3 -> hihat, Row 4+ -> all
    const filterMap = ['kick', 'snare', 'sfx', 'hihat'];
    return filterMap[rowIndex] || 'all';
  };

  const generateAutoPattern = () => {
    setIsGenerating(true);
    
    // Randomly change tempo (40-400 BPM for diverse musical styles)
    const randomTempo = Math.floor(Math.random() * 361) + 40; // 40-400 BPM
    changeTempo(randomTempo);
    
    // Randomly change time signature
    const timeSignatures = [
      { beats: 4, noteValue: 4 }, // 4/4
      { beats: 3, noteValue: 4 }, // 3/4
      { beats: 2, noteValue: 4 }, // 2/4
      { beats: 6, noteValue: 8 }, // 6/8
    ];
    const randomTimeSig = timeSignatures[Math.floor(Math.random() * timeSignatures.length)];
    setTimeSignature(randomTimeSig);
    
    // Randomly change steps (8, 16, or 32)
    const stepOptions = [8, 16, 32];
    const randomSteps = stepOptions[Math.floor(Math.random() * stepOptions.length)];
    changeSteps(randomSteps);
    
    // Wait for state updates, then generate pattern
    setTimeout(() => {
      generatePatternForTimeSignature(randomTimeSig, randomSteps);
      assignRandomSounds();
      setIsGenerating(false);
    }, 300); // Longer delay for visual effect
  };

  const generatePatternForTimeSignature = (timeSig: { beats: number; noteValue: number }, patternSteps: number) => {
    const newGrid = Array(INITIAL_INSTRUMENTS).fill(null).map(() => Array(patternSteps).fill(false));
    
    // Generate random patterns based on time signature
    const { beats } = timeSig;
    const stepsPerBeat = Math.floor(patternSteps / beats);
    
    // Row 0: Kick drum patterns
    generateKickPattern(newGrid[0], beats, stepsPerBeat);
    
    // Row 1: Snare drum patterns  
    generateSnarePattern(newGrid[1], beats, stepsPerBeat);
    
    // Row 2: FX patterns
    generateFXPattern(newGrid[2], beats, stepsPerBeat);
    
    // Row 3: Hi-hat patterns
    generateHihatPattern(newGrid[3], beats, stepsPerBeat);
    
    setGrid(newGrid);
  };

  const assignRandomSounds = () => {
    const newSelectedSounds = [...selectedSounds];
    
    // Row 0: Random kick sound
    const kickSounds = DRUM_SOUNDS.filter(s => s.type === 'kick');
    newSelectedSounds[0] = kickSounds[Math.floor(Math.random() * kickSounds.length)].name;
    
    // Row 1: Random snare sound
    const snareSounds = DRUM_SOUNDS.filter(s => s.type === 'snare');
    newSelectedSounds[1] = snareSounds[Math.floor(Math.random() * snareSounds.length)].name;
    
    // Row 2: Random FX sound
    const fxSounds = DRUM_SOUNDS.filter(s => s.type === 'sfx');
    newSelectedSounds[2] = fxSounds[Math.floor(Math.random() * fxSounds.length)].name;
    
    // Row 3: Random hi-hat sound
    const hihatSounds = DRUM_SOUNDS.filter(s => s.type === 'hihat');
    newSelectedSounds[3] = hihatSounds[Math.floor(Math.random() * hihatSounds.length)].name;
    
    setSelectedSounds(newSelectedSounds);
  };

  const generateKickPattern = (row: boolean[], beats: number, stepsPerBeat: number) => {
    // Always place kick on beat 1
    row[0] = true;
    
    // Different kick patterns based on time signature and random style
    const style = Math.random();
    
    if (beats === 4) {
      // 4/4 patterns
      if (style > 0.7) {
        // Standard rock pattern
        if (stepsPerBeat >= 2) row[2 * stepsPerBeat] = true; // Beat 3
      } else if (style > 0.4) {
        // Four-on-the-floor
        for (let i = 0; i < row.length; i += stepsPerBeat) {
          row[i] = true;
        }
      } else {
        // Complex pattern
        if (stepsPerBeat >= 2) row[2 * stepsPerBeat] = true; // Beat 3
        if (stepsPerBeat >= 1.5) row[Math.floor(1.5 * stepsPerBeat)] = true; // Beat 2.5
      }
    } else if (beats === 3) {
      // 3/4 patterns (waltz)
      if (stepsPerBeat >= 2) row[2 * stepsPerBeat] = true; // Beat 3
    } else if (beats === 2) {
      // 2/4 patterns (march)
      // Only on beat 1, maybe beat 2
      if (Math.random() > 0.5 && stepsPerBeat < row.length) {
        row[stepsPerBeat] = true;
      }
    } else if (beats === 6) {
      // 6/8 patterns
      if (stepsPerBeat >= 1) row[Math.floor(3 * stepsPerBeat)] = true; // Beat 4
    }
    
    // Add some off-beat kicks randomly (15% chance)
    for (let i = 1; i < row.length; i++) {
      if (i % stepsPerBeat !== 0 && Math.random() > 0.85) {
        row[i] = true;
      }
    }
  };

  const generateSnarePattern = (row: boolean[], beats: number, stepsPerBeat: number) => {
    const style = Math.random();
    
    if (beats === 4) {
      // 4/4 patterns
      if (style > 0.8) {
        // Standard rock pattern
        if (stepsPerBeat < row.length) row[stepsPerBeat] = true; // Beat 2
        if (3 * stepsPerBeat < row.length) row[3 * stepsPerBeat] = true; // Beat 4
      } else if (style > 0.6) {
        // Funk pattern - more ghost notes
        if (stepsPerBeat < row.length) row[stepsPerBeat] = true; // Beat 2
        if (3 * stepsPerBeat < row.length) row[3 * stepsPerBeat] = true; // Beat 4
        // Add ghost notes
        for (let i = 0; i < row.length; i++) {
          if (i % stepsPerBeat !== 0 && Math.random() > 0.88) {
            row[i] = true;
          }
        }
      } else if (style > 0.3) {
        // Reggae pattern - emphasis on 3
        if (2 * stepsPerBeat < row.length) row[2 * stepsPerBeat] = true; // Beat 3
      } else {
        // Hip-hop pattern - backbeat emphasis
        if (stepsPerBeat < row.length) row[stepsPerBeat] = true; // Beat 2
        if (3 * stepsPerBeat < row.length) row[3 * stepsPerBeat] = true; // Beat 4
        // Add some off-beat snares
        if (Math.random() > 0.5) {
          const offBeat = Math.floor(1.5 * stepsPerBeat);
          if (offBeat < row.length) row[offBeat] = true;
        }
      }
    } else if (beats === 3) {
      // 3/4 patterns (waltz)
      if (stepsPerBeat < row.length) row[stepsPerBeat] = true; // Beat 2
      if (2 * stepsPerBeat < row.length) row[2 * stepsPerBeat] = true; // Beat 3
    } else if (beats === 2) {
      // 2/4 patterns (march)
      if (stepsPerBeat < row.length) row[stepsPerBeat] = true; // Beat 2
    } else if (beats === 6) {
      // 6/8 patterns
      if (2 * stepsPerBeat < row.length) row[2 * stepsPerBeat] = true; // Beat 3
      if (5 * stepsPerBeat < row.length) row[5 * stepsPerBeat] = true; // Beat 6
    }
  };

  const generateFXPattern = (row: boolean[], beats: number, stepsPerBeat: number) => {
    const style = Math.random();
    
    if (style > 0.7) {
      // Sparse accents - only on strong beats
      for (let i = 0; i < row.length; i += stepsPerBeat) {
        if (Math.random() > 0.7) {
          row[i] = true;
        }
      }
    } else if (style > 0.4) {
      // Medium density - accents and fills
      for (let i = 0; i < row.length; i++) {
        if (Math.random() > 0.9) {
          row[i] = true;
        }
      }
    } else {
      // Dense pattern - lots of FX
      for (let i = 0; i < row.length; i++) {
        if (Math.random() > 0.85) {
          row[i] = true;
        }
      }
    }
    
    // Always add at least one FX hit
    if (!row.some(hit => hit)) {
      row[Math.floor(Math.random() * row.length)] = true;
    }
  };

  const generateHihatPattern = (row: boolean[], beats: number, stepsPerBeat: number) => {
    const style = Math.random();
    
    if (beats === 4) {
      // 4/4 patterns
      if (style > 0.8) {
        // Straight eighth notes
        for (let i = 0; i < row.length; i += 2) {
          row[i] = true;
        }
        // Add closed hi-hats
        for (let i = 1; i < row.length; i += 2) {
          if (Math.random() > 0.6) {
            row[i] = true;
          }
        }
      } else if (style > 0.6) {
        // Shuffle feel
        for (let i = 0; i < row.length; i += 3) {
          row[i] = true;
          if (i + 2 < row.length) row[i + 2] = true;
        }
      } else if (style > 0.3) {
        // Complex pattern with accents
        for (let i = 0; i < row.length; i += 2) {
          row[i] = true;
        }
        // Add some off-beat hits
        for (let i = 1; i < row.length; i += 4) {
          if (Math.random() > 0.5) {
            row[i] = true;
          }
        }
      } else {
        // Sparse pattern
        for (let i = 0; i < row.length; i += 4) {
          row[i] = true;
        }
      }
    } else if (beats === 3) {
      // 3/4 time - waltz feel
      for (let i = 0; i < row.length; i += Math.max(1, Math.floor(stepsPerBeat / 2))) {
        row[i] = true;
      }
      // Add some off-beat hits
      for (let i = 1; i < row.length; i += Math.max(1, Math.floor(stepsPerBeat))) {
        if (Math.random() > 0.7) {
          row[i] = true;
        }
      }
    } else if (beats === 2) {
      // 2/4 time - march feel
      for (let i = 0; i < row.length; i += Math.max(1, Math.floor(stepsPerBeat / 2))) {
        row[i] = true;
      }
    } else if (beats === 6) {
      // 6/8 time - compound feel
      for (let i = 0; i < row.length; i += Math.max(1, Math.floor(stepsPerBeat / 3))) {
        row[i] = true;
      }
      // Add some off-beat hits
      for (let i = 1; i < row.length; i += Math.max(1, Math.floor(stepsPerBeat / 3))) {
        if (Math.random() > 0.6) {
          row[i] = true;
        }
      }
    }
  };

  return (
    <>
      <div className={styles.controlsContainer}>
        {/* Transport Controls Bar */}
        <TransportControls
          isPlaying={isPlaying}
          tempo={tempo}
          steps={steps}
          volume={volume}
          timeSignature={timeSignature}
          onPlay={startPlayback}
          onStop={stopPlayback}
          onReset={reset}
          onTempoChange={changeTempo}
          onStepsChange={changeSteps}
          onVolumeChange={setInternalVolume}
          onTimeSignatureChange={setTimeSignature}
        />

        {/* Pattern Controls Bar */}
        <PatternControls
          gridLength={grid.length}
          maxInstruments={MAX_INSTRUMENTS}
          maxFreeRows={MAX_FREE_ROWS}
          isSoundSidebarOpen={isSoundSidebarOpen}
          isGenerating={isGenerating}
          onAddRow={addInstrumentRow}
          onToggleSoundSidebar={() => setIsSoundSidebarOpen(!isSoundSidebarOpen)}
          onGenerateAutoPattern={generateAutoPattern}
          onOpenPremiumModal={openPremiumModal}
          onOpenCustomSoundModal={() => setIsCustomSoundModalOpen(true)}
        />
      </div>

      <div className={styles.drumDesigner}>
        <br />
        <DrumGrid
          grid={grid}
          selectedSounds={selectedSounds}
          currentStep={currentStep}
          steps={steps}
          selectedRowForSound={selectedRowForSound}
          expandedDropdown={expandedDropdown}
          timeSignature={timeSignature}
          onToggleCell={toggleCell}
          onSelectRowForSound={(rowIndex) => {
            if (selectedRowForSound === rowIndex) {
              setSelectedRowForSound(null);
              setIsSoundSidebarOpen(false);
            } else {
              setSelectedRowForSound(rowIndex);
              setExpandedDropdown(null);
              // Set the recommended filter for this row
              const recommendedFilter = getRecommendedFilterForRow(rowIndex);
              setSoundFilter(recommendedFilter);
              setIsSoundSidebarOpen(true);
            }
          }}
          onExpandDropdown={setExpandedDropdown}
          onSelectSound={(rowIndex, soundName) => {
            const updated = [...selectedSounds];
            updated[rowIndex] = soundName;
            setSelectedSounds(updated);
            setExpandedDropdown(null);
          }}
          onAddRow={addInstrumentRow}
        />


        <SoundSidebar
          isOpen={isSoundSidebarOpen}
          soundFilter={soundFilter}
          selectedRowForSound={selectedRowForSound}
          previewedSound={previewedSound}
          onClose={closeSidebar}
          onFilterChange={setSoundFilter}
          onSoundPreview={handleSoundPreview}
          onSetSound={selectSoundForRow}
          getRecommendedFilterForRow={getRecommendedFilterForRow}
        />

        {/* Drum Sequencer - handles playback logic */}
        <DrumSequencer
          grid={grid}
          selectedSounds={selectedSounds}
          isPlaying={isPlaying}
          tempo={tempo}
          steps={steps}
          volume={volume}
          onStepChange={handleStepChange}
        />

        {backingTrack && <audio src={backingTrack} controls autoPlay loop />}
        <br />
      </div>

      {/* Premium Row Unlock Modal */}
      <PremiumRowModal
        isOpen={isPremiumModalOpen}
        onClose={closePremiumModal}
        onUnlockSingle={unlockSingleRow}
        onUnlockTriple={unlockTripleRows}
        currentRows={grid.length}
        maxFreeRows={MAX_FREE_ROWS}
        userCoins={user?.bbcPoints || 0}
        singleRowPrice={SINGLE_ROW_PRICE}
        tripleRowPrice={TRIPLE_ROW_PRICE}
        action={premiumModalAction}
      />

      {/* Custom Sound Upload Modal */}
      <CustomSoundModal
        isOpen={isCustomSoundModalOpen}
        onClose={() => setIsCustomSoundModalOpen(false)}
        customSounds={customSounds}
        onAddSound={addCustomSound}
        onRemoveSound={removeCustomSound}
        onSelectSound={selectCustomSound}
      />
    </>
  );
});

DrumDesigner.displayName = 'DrumDesigner';

export default DrumDesigner;
