'use client';

import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useMidiInput } from '@/hooks/useMidiInput';
import { useBlockBeatsAnalytics } from '@/utils/analytics/blockbeatsEvents';
import PlaybackControls from '@/components/machines/PlaybackControls';

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

export default function MusicDrawingMachine() {
  const { user } = useAuth();
  const { trackMusicCreation, trackNFTCreation } = useBlockBeatsAnalytics();

  const [notesPlayed, setNotesPlayed] = useState<{ noteIndex: number; time: number }[]>([]);
  const [colorMap, setColorMap] = useState<{ noteIndex: number; time: number; color: string }[]>([]);
  const [selectedRange, setSelectedRange] = useState('Ornamental');
  const [selectedScale, setSelectedScale] = useState<ScaleName>('minor');
  const [tempo, setTempo] = useState(SEQUENCER.DEFAULT_TEMPO);
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [isFreqModalOpen, setFreqModalOpen] = useState(false);
  const [isDrumEnabled, setIsDrumEnabled] = useState(true);
  const [stepLength, setStepLength] = useState(100);

  const stopMelodyRef = useRef<(() => void) | null>(null);
  const stopDrumRef = useRef<(() => void) | null>(null);

  const chordBuffer = useRef<number[]>([]);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [nextTimeStep, setNextTimeStep] = useState(0);

  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string | null>(null);

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;

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
    setNextTimeStep((prev) => (prev + 1) % stepLength);

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
      setNextTimeStep((prev) => (prev + 1) % stepLength);

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
    setIsPlayingBack(false);
    setPlayIndex(null);
  }, []);

  const playback = () => {
    if (!notesPlayed.length) return toast('Nothing to play!');
    setIsPlayingBack(true);

    const freqMap = notes.map((n) => n[1]);
    let currentStep = 0;
    const interval = (60 / tempo) * 1000;

    if (isDrumEnabled) {
      stopDrumRef.current = playDrumLoop(tempo, () => {
        stopDrumRef.current = null;
      }, stepLength);
    }

    const intervalId = setInterval(() => {
      setPlayIndex(currentStep);
      const notesAtStep = notesPlayed.filter(n => n.time === currentStep);
      notesAtStep.forEach(({ noteIndex }) => {
        playNote(freqMap[noteIndex]);
      });

      currentStep++;
      if (currentStep >= stepLength) {
        clearInterval(intervalId);
        stopDrumRef.current?.();
        setIsPlayingBack(false);
        setPlayIndex(null);
      }
    }, interval);

    stopMelodyRef.current = () => {
      clearInterval(intervalId);
      setPlayIndex(null);
      setIsPlayingBack(false);
    };
  };

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
        <header className={styles.topBar}>
          <PlaybackControls
            isPlaying={isPlayingBack}
            tempo={tempo}
            steps={stepLength}
            onPlay={playback}
            onStop={stopPlayback}
            onTempoChange={setTempo}
            onStepChange={setStepLength}
            onReset={handleReset}
            onSave={saveNFTData}
            showFreq={true}
            onOpenFrequencyModal={() => setFreqModalOpen(true)}
            showDrumsToggle={true}
            isDrumEnabled={isDrumEnabled}
            onToggleDrums={setIsDrumEnabled}
          />
        </header>

        <main className={styles.canvasSection}>
          <PixelCanvas
            colorMap={colorMap}
            playingIndex={playIndex}
            color={frequencyStyle.color}
            onCanvasClick={handleCanvasClick}
            cols={stepLength}
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
}
