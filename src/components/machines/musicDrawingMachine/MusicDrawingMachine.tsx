'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import toast from 'react-hot-toast';
import MusicDrawingMachinePlaybackControls from './PlaybackControls';
import { addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useMidiInput } from '@/hooks/useMidiInput';
import { useBlockBeatsAnalytics } from '@/utils/analytics/blockbeatsEvents';

import {
  notes,
  frequencyRanges,
  SEQUENCER,
  AUDIO,
  midiNoteToFrequency,
  ScaleName,
  scaleIntervals,
  SCALE_NAMES
} from '@/utils/constants/musicDrawingMachine';

import {
  playNote,
  playDrumLoop
} from '@/utils/helpers/drumHelper';

import {
  RANDOM_COLOR,
  TOGGLE,
  TOGGLE_COLOR
} from '@/utils/helpers/pixelHelper';

import PixelCanvas from './PixelCanvas';
import Piano from './Piano';
import FrequencyModal from './FrequencyModal';
import RandomMelodyModal from './RandomMelodyModal';
import QuickGenerateModal from './QuickGenerateModal';
import ColorSidebar from './ColorSidebar';

import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

// BBC Points costs for premium features
const RANDOM_MELODY_COST = 250;
const QUICK_GENERATE_COST = 100;

interface MusicDrawingMachineProps {
  isPlaying?: boolean;
  onPlay?: () => void;
  onStop?: () => void;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
  steps?: number;
  onStepsChange?: (steps: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  isDrumEnabled?: boolean;
  onDrumToggle?: (enabled: boolean) => void;
  onFreqModalOpen?: () => void;
  currentTime?: string;
  setCurrentTime?: (time: string) => void;
}

export interface MusicDrawingMachineRef {
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  save: () => void;
  openFreqModal: () => void;
  toggleDrums: () => void;
  stopDrums: () => void;
  generateRandomMelody: (options: {
    scale: ScaleName;
    mode: 'single' | 'chords' | 'both';
    density: number;
    tempo?: number;
    steps?: number;
    useRandomColors?: boolean;
  }) => void;
  getData: () => {
    notesPlayed: { noteIndex: number; time: number }[];
    colorMap: { noteIndex: number; time: number; color: string }[];
    selectedRange: string;
    isDrumEnabled: boolean;
  };
}

const MusicDrawingMachine = forwardRef<MusicDrawingMachineRef, MusicDrawingMachineProps>(({
  isPlaying = false,
  onPlay,
  onStop,
  tempo: externalTempo,
  onTempoChange,
  steps: externalSteps,
  onStepsChange,
  volume: externalVolume,
  onVolumeChange,
  isDrumEnabled: externalDrumEnabled,
  onDrumToggle,
  onFreqModalOpen,
  currentTime: externalCurrentTime,
  setCurrentTime
}, ref) => {
  const { user } = useAuth();
  const { trackMusicCreation, trackNFTCreation } = useBlockBeatsAnalytics();

  const [notesPlayed, setNotesPlayed] = useState<{ noteIndex: number; time: number }[]>([]);
  const [colorMap, setColorMap] = useState<{ noteIndex: number; time: number; color: string }[]>([]);
  const [selectedRange, setSelectedRange] = useState('Ornamental');
  const [selectedScale, setSelectedScale] = useState<ScaleName>('minor');
  
  // Internal state for tempo and steps
  const [internalTempo, setInternalTempo] = useState(120);
  const [internalSteps, setInternalSteps] = useState(32);
  const [internalVolume, setInternalVolume] = useState(80); // Default volume at 80%
  
  // Use external props or fallback to internal state
  const tempo = externalTempo ?? internalTempo;
  const steps = externalSteps ?? internalSteps;
  const volume = externalVolume ?? internalVolume;
  
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [isFreqModalOpen, setFreqModalOpen] = useState(false);
  const [isRandomMelodyModalOpen, setRandomMelodyModalOpen] = useState(false);
  
  // Internal state for independent operation
  const [internalIsDrumEnabled, setInternalIsDrumEnabled] = useState(true);
  
  // Determine the actual drum state - use external if provided, otherwise use internal
  const isDrumEnabled = externalDrumEnabled !== undefined ? externalDrumEnabled : internalIsDrumEnabled;

  const stopMelodyRef = useRef<(() => void) | null>(null);
  const stopDrumRef = useRef<(() => void) | null>(null);

  const chordBuffer = useRef<number[]>([]);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [nextTimeStep, setNextTimeStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string | null>(null);
  const [isSilenceMode, setIsSilenceMode] = useState(false);
  const [isColorSidebarOpen, setIsColorSidebarOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [isQuickGenerateModalOpen, setIsQuickGenerateModalOpen] = useState(false);

  // Auth context for BBC points
  const { updateCoinsInFirestore } = useAuth();

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;

  // BBC Points validation and payment functions
  const canAffordRandomMelody = user && (user.bbcPoints || 0) >= RANDOM_MELODY_COST;
  const canAffordQuickGenerate = user && (user.bbcPoints || 0) >= QUICK_GENERATE_COST;

  const handleRandomMelodyClick = async () => {
    if (!user) {
      toast.error('Please log in to use Random Melody generation!');
      return;
    }

    if (!canAffordRandomMelody) {
      toast.error(`Insufficient BBC coins! Need ${RANDOM_MELODY_COST} coins.`);
      return;
    }

    try {
      // Deduct coins
      await updateCoinsInFirestore(-RANDOM_MELODY_COST, 'Random Melody Generation');
      setRandomMelodyModalOpen(true);
      toast.success('Random Melody unlocked! 🎵');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  const handleQuickGenerateClick = async () => {
    if (!user) {
      toast.error('Please log in to use Quick Generate!');
      return;
    }

    if (!canAffordQuickGenerate) {
      toast.error(`Insufficient BBC coins! Need ${QUICK_GENERATE_COST} coins.`);
      return;
    }

    try {
      // Deduct coins
      await updateCoinsInFirestore(-QUICK_GENERATE_COST, 'Quick Generate by Genre');
      setIsQuickGenerateModalOpen(true);
      toast.success('Quick Generate unlocked! 🚀');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  // Add silence/blank step function
  const addSilence = useCallback((timeStep: number) => {
    // Add a special "silence" note with index -1 to represent a blank step
    const silenceNote = { noteIndex: -1, time: timeStep };
    const silenceColor = { noteIndex: -1, time: timeStep, color: '#333333' }; // Dark gray for silence
    
    setNotesPlayed((prev) => [...prev, silenceNote]);
    setColorMap((prev) => [...prev, silenceColor]);
    
    // Move to next time step
    setNextTimeStep((prev) => prev + 1);
    
    toast.success(`🔇 Silence added at step ${timeStep + 1}`);
  }, []);

  // Random melody generator
  const generateRandomMelody = useCallback((options: {
    scale: ScaleName;
    mode: 'single' | 'chords' | 'both';
    density: number; // 0.1 to 1.0
    tempo?: number;
    steps?: number;
    useRandomColors?: boolean;
  }) => {
    const { scale, mode, density, tempo: newTempo, steps: newSteps, useRandomColors = false } = options;
    
    // Generate random tempo and steps if not provided
    const randomTempo = newTempo || Math.floor(Math.random() * 361) + 40; // 40-400 BPM
    const randomSteps = newSteps || Math.floor(Math.random() * 25) + 8; // 8-32 steps
    
    // Update tempo and steps
    if (randomTempo !== tempo) {
      setInternalTempo(randomTempo);
    }
    if (randomSteps !== steps) {
      setInternalSteps(randomSteps);
    }

    // Get scale intervals
    const intervals = scaleIntervals[scale];
    if (!intervals) {
      toast.error(`Scale ${scale} not found`);
      return;
    }

    // Generate random root note (focus on middle range for better sound)
    const middleRangeStart = Math.floor(notes.length * 0.3); // Start from 30% of range
    const middleRangeEnd = Math.floor(notes.length * 0.7);   // End at 70% of range
    const rootNoteIndex = Math.floor(Math.random() * (middleRangeEnd - middleRangeStart)) + middleRangeStart;
    const rootNote = notes[rootNoteIndex];
    const rootFreq = rootNote[1];

    const newNotes: Array<{ noteIndex: number; time: number; color: string }> = [];
    const newColors: Array<{ noteIndex: number; time: number; color: string }> = [];

    // Generate notes based on mode
    const finalSteps = randomSteps;
    const finalTempo = randomTempo;

    // Ensure we generate at least some notes
    const minNotes = Math.max(1, Math.floor(finalSteps * 0.1)); // At least 10% of steps
    let notesGenerated = 0;
    
    for (let step = 0; step < finalSteps; step++) {
      // Skip some steps based on density, but ensure minimum notes
      if (Math.random() > density && notesGenerated >= minNotes) continue;

      const time = step; // Use discrete step values for compatibility

      if (mode === 'single' || mode === 'both') {
        // Generate single note
        const intervalIndex = Math.floor(Math.random() * intervals.length);
        const interval = intervals[intervalIndex];
        const noteIndex = (rootNoteIndex + interval) % notes.length;
        
        const noteColor = useRandomColors ? RANDOM_COLOR() : '#ffffff';
        newNotes.push({
          noteIndex,
          time,
          color: noteColor
        });
        newColors.push({
          noteIndex,
          time,
          color: noteColor
        });
        notesGenerated++;
      }

      if (mode === 'chords' || mode === 'both') {
        // Generate chord (2-4 notes) with unique notes
        const chordSize = Math.floor(Math.random() * 3) + 2; // 2-4 notes
        const chordNotes: number[] = [];
        const usedIntervals = new Set<number>();
        
        for (let i = 0; i < chordSize; i++) {
          let intervalIndex, interval, noteIndex;
          let attempts = 0;
          
          // Try to find a unique interval (max 10 attempts to avoid infinite loop)
          do {
            intervalIndex = Math.floor(Math.random() * intervals.length);
            interval = intervals[intervalIndex];
            noteIndex = (rootNoteIndex + interval) % notes.length;
            attempts++;
          } while (usedIntervals.has(interval) && attempts < 10);
          
          usedIntervals.add(interval);
          chordNotes.push(noteIndex);
        }

        // Add chord notes
        chordNotes.forEach(noteIndex => {
          const chordColor = useRandomColors ? RANDOM_COLOR() : '#ffffff';
          newNotes.push({
            noteIndex,
            time, // Same discrete time value for all chord notes
            color: chordColor
          });
          newColors.push({
            noteIndex,
            time, // Same discrete time value for all chord notes
            color: chordColor
          });
          notesGenerated++;
        });
      }
    }

    // Update state
    setNotesPlayed(newNotes);
    setColorMap(newColors);
    
    toast.success(`🎵 Generated ${scale} melody with ${newNotes.length} notes! Tempo: ${randomTempo} BPM, Steps: ${randomSteps}`);
  }, [tempo, steps, setInternalTempo, setInternalSteps]);


  // 🧠 MIDI FIX — matching by midi note number instead of frequency
  useMidiInput({
    onMidiNote: (midiNote) => {
      const noteIdx = notes.findIndex(([label, freq]) => {
        const expectedMidi = Math.round(69 + 12 * Math.log2(Number(freq) / 440));
        return expectedMidi === midiNote;
      });

      if (noteIdx >= 0) {
        console.log(`🎹 MIDI Note ${midiNote} → Index: ${noteIdx}`);
        handleNotePlay(noteIdx, true);
      } else {
        console.warn(`⚠️ Unmapped MIDI note: ${midiNote}`);
      }
    },
    onDeviceConnect: (deviceName) => {
      setMidiConnected(true);
      setMidiDeviceName(deviceName);
      console.log(`✅ MIDI Connected: ${deviceName}`);
    },
    onDeviceDisconnect: () => {
      setMidiConnected(false);
      setMidiDeviceName(null);
      console.warn(`❌ MIDI Disconnected`);
    },
  });

  const handleCanvasClick = (noteIdx: number, time: number) => {
    const updatedNotes = TOGGLE(notesPlayed, noteIdx, time);
    const updatedColors = TOGGLE_COLOR(colorMap, noteIdx, time, selectedColor);

    setNotesPlayed(updatedNotes);
    setColorMap(updatedColors);
    playNote(notes[noteIdx][1], AUDIO.NOTE_LENGTH, volume);
    setNextTimeStep(time + 1);
  };

const handleNotePlay = (noteIdx: number, isMidi = false) => {
  playNote(notes[noteIdx][1]);

  if (isMidi) {
    // ⏩ MIDI behavior: instant recording and time advancement
    const time = nextTimeStep;
    setNextTimeStep((prev) => (prev + 1) % steps);

    const newNote = { noteIndex: noteIdx, time };
    const newColor = { noteIndex: noteIdx, time, color: selectedColor };

    setNotesPlayed((prev) => [...prev, newNote]);
    setColorMap((prev) => [...prev, newColor]);

  } else {
    // 🎹 Pointer or virtual keyboard behavior (group notes into chords)
    chordBuffer.current.push(noteIdx);

    if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current);

    chordTimeoutRef.current = setTimeout(() => {
      const time = nextTimeStep;
      setNextTimeStep((prev) => (prev + 1) % steps);

      const chordNotes = chordBuffer.current.map((noteIndex) => ({
        noteIndex,
        time,
      }));
      const chordColors = chordBuffer.current.map((noteIndex) => ({
        noteIndex,
        time,
        color: selectedColor,
      }));

      setNotesPlayed((prev) => [...prev, ...chordNotes]);
      setColorMap((prev) => [...prev, ...chordColors]);

      chordBuffer.current = [];
    }, 300);
  }
};


  const saveNFTData = async () => {
    const songName = prompt('Name your song-art NFT:');
    if (!songName) return toast.error('You must name your song');

    try {
      await addDoc(collection(db, 'signatures'), {
        songName,
        notesPlayed,
        colorMap,
        frequencyRange: selectedRange,
        color: frequencyStyle.color,
        tempo,
        createdAt: new Date(),
        createdBy: user?.uid,
        id: uuidv4(),
      });
      
      // Track NFT creation
      trackNFTCreation(songName, 'drawing', tempo);
      trackMusicCreation('drawing');
      
      toast.success('Saved as NFT!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save NFT');
    }
  };

  const pausePlayback = useCallback(() => {
    setIsPaused(true);
    stopMelodyRef.current?.();
    stopDrumRef.current?.();
    // Keep current step position for resume
  }, []);

  const resumePlayback = useCallback(() => {
    if (!notesPlayed.length) return toast('Nothing to play!');
    
    setIsPaused(false);
    
    const freqMap = notes.map((n) => n[1]);
    let stepCounter = currentStep;
    const interval = (60 / tempo) * 1000;

    const currentDrumEnabled = isDrumEnabled;
    console.log('🥁 Playback drums state:', { 
      isDrumEnabled, 
      currentDrumEnabled,
      tempo,
      steps 
    });
    
    if (currentDrumEnabled) {
      console.log('🥁 Starting drums...');
      stopDrumRef.current = playDrumLoop(tempo, () => {
        stopDrumRef.current = null;
      }, steps);
    } else {
      console.log('🥁 Drums disabled, skipping drum loop');
    }

    const intervalId = setInterval(() => {
      if (isPaused) {
        clearInterval(intervalId);
        return;
      }
      
      setPlayIndex(stepCounter);
      setCurrentStep(stepCounter);
      const notesAtStep = notesPlayed.filter(n => n.time === stepCounter);
      notesAtStep.forEach(({ noteIndex }) => {
        // Skip silence notes (noteIndex === -1)
        if (noteIndex !== -1 && freqMap[noteIndex]) {
          playNote(freqMap[noteIndex], AUDIO.NOTE_LENGTH, volume);
        }
      });

      stepCounter++;
      if (stepCounter >= steps) {
        clearInterval(intervalId);
        stopDrumRef.current?.();
        setPlayIndex(null);
        setCurrentStep(0);
        setIsPaused(false);
        onStop?.(); // Call external stop handler when song finishes
      }
    }, interval);

    stopMelodyRef.current = () => {
      clearInterval(intervalId);
      setPlayIndex(null);
      setCurrentStep(0);
      setIsPaused(false);
    };
  }, [notesPlayed.length, tempo, steps, isDrumEnabled, onStop, currentStep]);

  const stopPlayback = useCallback(() => {
    stopMelodyRef.current?.();
    stopDrumRef.current?.();
    setPlayIndex(null);
    setCurrentStep(0);
    setIsPaused(false);
    onStop?.(); // Call external stop handler
  }, [onStop]);

  const playback = useCallback(() => {
    if (!notesPlayed.length) return toast('Nothing to play!');
    
    // If paused, just resume (don't restart)
    if (isPaused) {
      setIsPaused(false);
      return;
    }
    
    // Start fresh playback
    onPlay?.(); // Call external play handler
    setCurrentStep(0);
    setIsPaused(false);

    const freqMap = notes.map((n) => n[1]);
    let stepCounter = 0;
    const interval = (60 / tempo) * 1000;

    const currentDrumEnabled = isDrumEnabled;
    console.log('🥁 Playback drums state:', { 
      isDrumEnabled, 
      currentDrumEnabled,
      tempo,
      steps 
    });
    
    if (currentDrumEnabled) {
      console.log('🥁 Starting drums...');
      stopDrumRef.current = playDrumLoop(tempo, () => {
        stopDrumRef.current = null;
      }, steps);
    } else {
      console.log('🥁 Drums disabled, skipping drum loop');
    }

    const intervalId = setInterval(() => {
      if (isPaused) {
        clearInterval(intervalId);
        return;
      }
      
      setPlayIndex(stepCounter);
      setCurrentStep(stepCounter);
      const notesAtStep = notesPlayed.filter(n => n.time === stepCounter);
      notesAtStep.forEach(({ noteIndex }) => {
        // Skip silence notes (noteIndex === -1)
        if (noteIndex !== -1 && freqMap[noteIndex]) {
          playNote(freqMap[noteIndex], AUDIO.NOTE_LENGTH, volume);
        }
      });

      stepCounter++;
      if (stepCounter >= steps) {
        clearInterval(intervalId);
        stopDrumRef.current?.();
        setPlayIndex(null);
        setCurrentStep(0);
        setIsPaused(false);
        onStop?.(); // Call external stop handler when song finishes
      }
    }, interval);

    stopMelodyRef.current = () => {
      clearInterval(intervalId);
      setPlayIndex(null);
      setCurrentStep(0);
      setIsPaused(false);
    };
  }, [notesPlayed.length, tempo, steps, isDrumEnabled, onPlay, onStop, isPaused]);

  // Handle external play/stop state changes
  useEffect(() => {
    if (isPlaying && notesPlayed.length > 0) {
      playback();
    } else if (!isPlaying) {
      stopPlayback();
    }
  }, [isPlaying, notesPlayed.length, playback, stopPlayback]);

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    play: playback,
    pause: pausePlayback,
    resume: resumePlayback,
    stop: stopPlayback,
    reset: handleReset,
    save: saveNFTData,
    openFreqModal: () => setFreqModalOpen(true),
    toggleDrums: () => {
      console.log('🥁 Toggling drums:', { 
        currentState: isDrumEnabled, 
        newState: !isDrumEnabled,
        hasExternalControl: !!onDrumToggle 
      });
      
      if (onDrumToggle) {
        // If external control is provided, use it
        onDrumToggle(!isDrumEnabled);
      } else {
        // Otherwise, toggle internal state
        setInternalIsDrumEnabled(!internalIsDrumEnabled);
      }
    },
    stopDrums: () => {
      stopDrumRef.current?.();
      stopDrumRef.current = null;
    },
    generateRandomMelody,
    getData: () => ({
      notesPlayed,
      colorMap,
      selectedRange,
      isDrumEnabled
    })
  }), [notesPlayed, colorMap, selectedRange, isDrumEnabled, onDrumToggle, internalIsDrumEnabled, generateRandomMelody, playback, pausePlayback, resumePlayback, stopPlayback]);

  const handleReset = () => {
    setNotesPlayed([]);
    setColorMap([]);
    setPlayIndex(null);
    stopPlayback();
    setNextTimeStep(0);
  };


  return (
    <>
      <div className={styles.fullScreenStudio}>
        {/* Video Background */}
        <video
          className={styles.machineVideoBackground}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/images/avatars/phase-3.mp4" type="video/mp4" />
        </video>
        
        {/* Video Overlay */}
        <div className={styles.videoOverlay}></div>
          
          <div className={styles.topBar}>
            {/* Dedicated Playback Controls */}
            <MusicDrawingMachinePlaybackControls
              isPlaying={isPlaying}
              isPaused={isPaused}
              tempo={tempo}
              steps={steps}
              isDrumEnabled={isDrumEnabled}
              selectedRange={selectedRange}
              volume={volume}
              isMidiConnected={midiConnected}
              onPlay={playback}
              onPause={pausePlayback}
              onResume={resumePlayback}
              onStop={stopPlayback}
              onReset={handleReset}
              onTempoChange={setInternalTempo}
              onStepsChange={setInternalSteps}
              onVolumeChange={setInternalVolume}
              onToggleDrums={(enabled) => {
                console.log('🥁 PlaybackControls onToggleDrums:', { 
                  enabled, 
                  currentState: isDrumEnabled,
                  hasExternalControl: !!onDrumToggle 
                });
                
                if (onDrumToggle) {
                  // If external control is provided, use it
                  onDrumToggle(enabled);
                } else {
                  // Otherwise, set internal state
                  setInternalIsDrumEnabled(enabled);
                }
              }}
              onOpenFreqModal={() => setFreqModalOpen(true)}
              onOpenRandomMelodyModal={handleRandomMelodyClick}
              onAddSilence={() => addSilence(nextTimeStep)}
              isSilenceMode={isSilenceMode}
              onOpenColorSidebar={() => setIsColorSidebarOpen(true)}
              onOpenQuickGenerate={handleQuickGenerateClick}
              userCoins={user?.bbcPoints || 0}
              randomMelodyCost={RANDOM_MELODY_COST}
              quickGenerateCost={QUICK_GENERATE_COST}
            />
        </div>


        <main className={styles.canvasSection}>
          <PixelCanvas
            colorMap={colorMap}
            playingIndex={playIndex}
            color={frequencyStyle.color}
            onCanvasClick={handleCanvasClick}
            cols={steps}
            fullscreen={true}
            notesPlayed={notesPlayed}
          />
        </main>

        <footer className={styles.bottomBar}>
          <Piano 
            onNotePlay={handleNotePlay} 
            onSilenceAdd={addSilence}
            isSilenceMode={isSilenceMode}
            currentTimeStep={nextTimeStep}
          />
        </footer>
      </div>

      {isFreqModalOpen && (
        <FrequencyModal
          selected={selectedRange}
          onSelect={setSelectedRange}
          onSubmit={() => setFreqModalOpen(false)}
        />
      )}

      {isRandomMelodyModalOpen && (
        <RandomMelodyModal
          isVisible={isRandomMelodyModalOpen}
          onClose={() => setRandomMelodyModalOpen(false)}
          onGenerate={generateRandomMelody}
        />
      )}

      <ColorSidebar
        isOpen={isColorSidebarOpen}
        selectedColor={selectedColor}
        onClose={() => setIsColorSidebarOpen(false)}
        onColorSelect={setSelectedColor}
      />

      <QuickGenerateModal
        isVisible={isQuickGenerateModalOpen}
        onClose={() => setIsQuickGenerateModalOpen(false)}
        onGenerate={generateRandomMelody}
      />
    </>
  );
});

MusicDrawingMachine.displayName = 'MusicDrawingMachine';

export default MusicDrawingMachine;
