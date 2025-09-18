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
  midiNoteToFrequency,
  ScaleName
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

import styles from '@/app/assets/styles/pages/MusicStudio.module.css';

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
  stop: () => void;
  reset: () => void;
  save: () => void;
  openFreqModal: () => void;
  toggleDrums: () => void;
  stopDrums: () => void;
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
  
  // Use external props or fallback to internal state
  const tempo = externalTempo ?? internalTempo;
  const steps = externalSteps ?? internalSteps;
  const volume = externalVolume ?? 80;
  const isDrumEnabled = externalDrumEnabled !== undefined ? externalDrumEnabled : true;
  
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [isFreqModalOpen, setFreqModalOpen] = useState(false);
  
  // Internal state for independent operation
  const [internalIsDrumEnabled, setInternalIsDrumEnabled] = useState(true);

  const stopMelodyRef = useRef<(() => void) | null>(null);
  const stopDrumRef = useRef<(() => void) | null>(null);

  const chordBuffer = useRef<number[]>([]);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [nextTimeStep, setNextTimeStep] = useState(0);

  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string | null>(null);

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;



  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    play: playback,
    stop: stopPlayback,
    reset: handleReset,
    save: saveNFTData,
    openFreqModal: () => setFreqModalOpen(true),
    toggleDrums: () => {
      if (onDrumToggle) {
        onDrumToggle(!isDrumEnabled);
      } else {
        setInternalIsDrumEnabled(!internalIsDrumEnabled);
      }
    },
    stopDrums: () => {
      stopDrumRef.current?.();
      stopDrumRef.current = null;
    },
    getData: () => ({
      notesPlayed,
      colorMap,
      selectedRange,
      isDrumEnabled
    })
  }), [notesPlayed, colorMap, selectedRange, isDrumEnabled, onDrumToggle, internalIsDrumEnabled]);

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
    const updatedColors = TOGGLE_COLOR(colorMap, noteIdx, time);

    setNotesPlayed(updatedNotes);
    setColorMap(updatedColors);
    playNote(notes[noteIdx][1]);
    setNextTimeStep(time + 1);
  };

const handleNotePlay = (noteIdx: number, isMidi = false) => {
  playNote(notes[noteIdx][1]);

  if (isMidi) {
    // ⏩ MIDI behavior: instant recording and time advancement
    const time = nextTimeStep;
    setNextTimeStep((prev) => (prev + 1) % steps);

    const newNote = { noteIndex: noteIdx, time };
    const newColor = { noteIndex: noteIdx, time, color: RANDOM_COLOR() };

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
        color: RANDOM_COLOR(),
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

  const stopPlayback = useCallback(() => {
    stopMelodyRef.current?.();
    stopDrumRef.current?.();
    setPlayIndex(null);
    onStop?.(); // Call external stop handler
  }, [onStop]);

  const playback = useCallback(() => {
    if (!notesPlayed.length) return toast('Nothing to play!');
    onPlay?.(); // Call external play handler

    const freqMap = notes.map((n) => n[1]);
    let currentStep = 0;
    const interval = (60 / tempo) * 1000;

    const currentDrumEnabled = externalDrumEnabled !== undefined ? isDrumEnabled : internalIsDrumEnabled;
    if (currentDrumEnabled) {
      stopDrumRef.current = playDrumLoop(tempo, () => {
        stopDrumRef.current = null;
      }, steps);
    }

    const intervalId = setInterval(() => {
      setPlayIndex(currentStep);
      const notesAtStep = notesPlayed.filter(n => n.time === currentStep);
      notesAtStep.forEach(({ noteIndex }) => {
        playNote(freqMap[noteIndex]);
      });

      currentStep++;
      if (currentStep >= steps) {
        clearInterval(intervalId);
        stopDrumRef.current?.();
        setPlayIndex(null);
        onStop?.(); // Call external stop handler when song finishes
      }
    }, interval);

    stopMelodyRef.current = () => {
      clearInterval(intervalId);
      setPlayIndex(null);
    };
  }, [notesPlayed.length, tempo, steps, isDrumEnabled, onPlay, onStop]);

  // Handle external play/stop state changes
  useEffect(() => {
    if (isPlaying && notesPlayed.length > 0) {
      playback();
    } else if (!isPlaying) {
      stopPlayback();
    }
  }, [isPlaying, notesPlayed.length, playback, stopPlayback]);

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
          
          <div className={styles.topBar}>
            {/* Dedicated Playback Controls */}
            <MusicDrawingMachinePlaybackControls
              isPlaying={isPlaying}
              tempo={tempo}
              steps={steps}
              isDrumEnabled={isDrumEnabled}
              selectedRange={selectedRange}
              onPlay={playback}
              onStop={stopPlayback}
              onReset={handleReset}
              onTempoChange={setInternalTempo}
              onStepsChange={setInternalSteps}
              onToggleDrums={(enabled) => {
                if (onDrumToggle) {
                  onDrumToggle(enabled);
                } else {
                  setInternalIsDrumEnabled(enabled);
                }
              }}
              onOpenFreqModal={() => setFreqModalOpen(true)}
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
          />
        </main>

        <footer className={styles.bottomBar}>
          <Piano onNotePlay={handleNotePlay} />
        </footer>
      </div>

      {isFreqModalOpen && (
        <FrequencyModal
          selected={selectedRange}
          onSelect={setSelectedRange}
          onSubmit={() => setFreqModalOpen(false)}
        />
      )}
    </>
  );
});

MusicDrawingMachine.displayName = 'MusicDrawingMachine';

export default MusicDrawingMachine;
