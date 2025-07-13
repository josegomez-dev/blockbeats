'use client';

import { useState, useRef, useCallback } from 'react';
import Modal from 'react-responsive-modal';
import toast from 'react-hot-toast';
import { addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../firebase';
import { useAuth } from '@/context/AuthContext';
import { useMidiInput } from '@/hooks/useMidiInput';

import {
  notes,
  frequencyRanges,
  scaleIntervals,
  SEQUENCER,
  AUDIO,
  midiNoteToFrequency,
  ScaleName
} from '@/utils/constants/musicDrawingMachine';

import {
  playNote,
  playMelody,
  playDrumLoop
} from '@/utils/helpers/drumHelper';

import {
  RANDOM_COLOR,
  TOGGLE,
  TOGGLE_COLOR,
  PICK_TWO,
  RANDOM
} from '@/utils/helpers/pixelHelper';

import PixelCanvas from '../components/PixelCanvas';
import Piano from '../components/Piano';
import AIMelodyControls from '../components/AIMelodyControls';
import FrequencyModal from '../components/FrequencyModal';

import styles from '@/app/assets/styles/MusicStudio.module.css';
import GalleryHeader from '@/components/GalleryHeader';

export default function MusicStudioPage() {
  const { user } = useAuth();

  const [notesPlayed, setNotesPlayed] = useState<{ noteIndex: number; time: number }[]>([]);
  const [colorMap, setColorMap] = useState<{ noteIndex: number; time: number; color: string }[]>([]);
  const [selectedRange, setSelectedRange] = useState('Harmonic');
  const [selectedScale, setSelectedScale] = useState<ScaleName>('minor');
  const [melodyKind, setMelodyKind] = useState<'chords' | 'solo' | 'both'>('both');
  const [firstNote, setFirstNote] = useState(notes[0][0]);
  const [tempo, setTempo] = useState(SEQUENCER.DEFAULT_TEMPO);
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [isFreqModalOpen, setFreqModalOpen] = useState(false);
  const [isAIModalOpen, setAIModalOpen] = useState(false);
  const [isDrumEnabled, setIsDrumEnabled] = useState(true);
  const [stepLength, setStepLength] = useState(80);

  const stopMelodyRef = useRef<(() => void) | null>(null);
  const stopDrumRef = useRef<(() => void) | null>(null);

  const chordBuffer = useRef<number[]>([]);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [nextTimeStep, setNextTimeStep] = useState(0);

  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string | null>(null);

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;

  useMidiInput({
    onMidiNote: (midiNote) => {
      const noteIdx = notes.findIndex(([note]) => midiNoteToFrequency(midiNote) === Number(note[1]));
      if (noteIdx >= 0) handleNotePlay(noteIdx);
    },
    onDeviceConnect: (deviceName) => {
      setMidiConnected(true);
      setMidiDeviceName(deviceName);
    },
    onDeviceDisconnect: () => {
      setMidiConnected(false);
      setMidiDeviceName(null);
    },
  });

  const handleCanvasClick = (noteIdx: number, time: number) => {
    setNotesPlayed(TOGGLE(notesPlayed, noteIdx, time));
    setColorMap(TOGGLE_COLOR(colorMap, noteIdx, time));
    playNote(notes[noteIdx][1]);
  };

  const handleNotePlay = (noteIdx: number) => {
    playNote(notes[noteIdx][1]);
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

  return (
    <>
      <div className={styles.fullScreenStudio}>
        <GalleryHeader title='Explore BlockBeats 3.0 STUDIO' />
        <header className={styles.topBar}>
          <div>🎹 MIDI: {midiConnected ? midiDeviceName : 'Not Connected'}</div>
          <div>🎛️ Tempo: 
              <input 
                type="number" 
                min={99} 
                max={450} 
                value={tempo} 
                onChange={(e) => setTempo(Number(e.target.value))} 
              />
          </div>
          <div>🎼 Steps: &nbsp;
              <input 
                type="number" 
                min={8} 
                max={128} 
                value={stepLength} 
                onChange={(e) => setStepLength(Number(e.target.value))} 
              /> 
          </div>

          <div className={styles.actions}>
            <button onClick={playback}>▶️ Play</button>
            <button onClick={stopPlayback}>⏹ Stop</button>
            <button onClick={() => { setNotesPlayed([]); setColorMap([]); setNextTimeStep(0); stopPlayback(); }}>🧹 Reset</button>
            <button onClick={saveNFTData}>💾 Save</button>
            <button onClick={() => setFreqModalOpen(true)}>🎨 Frequency</button>
          </div>
        </header>

        <main className={styles.canvasSection}>
          <PixelCanvas
            colorMap={colorMap}
            playingIndex={playIndex}
            color={frequencyStyle.color}
            onCanvasClick={handleCanvasClick}
            cols={stepLength}
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
