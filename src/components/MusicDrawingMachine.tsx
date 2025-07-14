'use client';

import { useRef, useState, useCallback } from 'react';
import Modal from 'react-responsive-modal';
import toast from 'react-hot-toast';
import { addDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../firebase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/assets/styles/MainPage.module.css';

import {
  frequencyRanges,
  notes,
  scaleIntervals,
  ScaleName,
  SEQUENCER,
  AUDIO,
  midiNoteToFrequency,
} from '@/utils/constants/musicDrawingMachine';
import { useMidiInput } from '@/hooks/useMidiInput';

import { playNote, playMelody, playDrumLoop } from '@/utils/helpers/drumHelper';
import { PICK_TWO, RANDOM, RANDOM_COLOR, TOGGLE, TOGGLE_COLOR } from '@/utils/helpers/pixelHelper';

import FrequencyModal from './FrequencyModal';
import PixelCanvas from './PixelCanvas';
import Piano from './Piano';
import NFTSliderPanel from './NFTSliderPanel';
import ControlsPanel from './ControlPanel';
import AIMelodyControls from './AIMelodyControls';

import type { TopCollections } from '@/types/topCollections';

interface Props {
  nfts?: any[];
  topCollections?: TopCollections[];
  simple?: boolean;
}

export default function MusicDrawingPage({ nfts = [], topCollections = [], simple }: Props) {
  const { user } = useAuth();

  const [notesPlayed, setNotesPlayed] = useState<{ noteIndex: number; time: number }[]>([]);
  const [colorMap, setColorMap] = useState<{ noteIndex: number; time: number; color: string }[]>([]);
  const [selectedRange, setSelectedRange] = useState('Harmonic');
  const [selectedScale, setSelectedScale] = useState<ScaleName>('minor');
  const [melodyKind, setMelodyKind] = useState<'chords' | 'solo' | 'both'>('both');
  const [firstNote, setFirstNote] = useState(notes[0][0]);
  const [tempo, setTempo] = useState(SEQUENCER.DEFAULT_TEMPO);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [isFreqModalOpen, setFreqModalOpen] = useState(false);
  const [isAIModalOpen, setAIModalOpen] = useState(false);
  const [isDrumEnabled, setIsDrumEnabled] = useState(true);
  const [midiDeviceName, setMidiDeviceName] = useState<string | null>(null);
  const [midiConnected, setMidiConnected] = useState(false);
  const [nextTimeStep, setNextTimeStep] = useState(0);
  
  const lastTouchRef = useRef<number>(0);
  const chordBuffer = useRef<number[]>([]);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopMelodyRef = useRef<(() => void) | null>(null);
  const stopDrumRef = useRef<(() => void) | null>(null);

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;

  const generateRandomMelody = useCallback(() => {
    const melody: { noteIndex: number; time: number }[] = [];
    const baseIdx = notes.findIndex(([n]) => n === firstNote);
    const intervals = scaleIntervals[selectedScale];
    if (baseIdx === -1 || !intervals) return melody;

    const scaleIdx: number[] = [];
    for (let octave = 0; octave < 2; octave++) {
      intervals.forEach((i) => {
        const idx = baseIdx + i + octave * 12;
        if (idx < notes.length) scaleIdx.push(idx);
      });
    }

    const usedTimes = new Set<number>();

    for (let t = 0; t < SEQUENCER.STEPS; t++) {
      if (Math.random() < 0.6 && !usedTimes.has(t)) {
        usedTimes.add(t);
        switch (melodyKind) {
          case 'chords': {
            const [a, b] = PICK_TWO(scaleIdx);
            melody.push({ noteIndex: a, time: t }, { noteIndex: b, time: t });
            break;
          }
          case 'solo':
            melody.push({ noteIndex: RANDOM(scaleIdx), time: t });
            break;
          case 'both': {
            melody.push({ noteIndex: RANDOM(scaleIdx), time: t });
            if (Math.random() < 0.25) {
              melody.push({ noteIndex: RANDOM(scaleIdx), time: t });
            }
            break;
          }
        }
      }
    }

    return melody;
  }, [firstNote, selectedScale, melodyKind]);

  useMidiInput({
    onMidiNote: (midiNote) => {
      const noteIdx = notes.findIndex(([note]) => midiNoteToFrequency(midiNote) === Number(note[1]));
      if (noteIdx >= 0) {
        handleNotePlay(noteIdx);
      }
    },
    onDeviceConnect: (deviceName) => {
      setMidiConnected(true);
      setMidiDeviceName(deviceName);
    },
    onDeviceDisconnect: () => {
      setMidiConnected(false);
      setMidiDeviceName(null);
    }
  });

  const loadRandomMelody = () => {
    const melody = generateRandomMelody();
    setNotesPlayed(melody);
    setColorMap(
      melody.map(({ noteIndex, time }) => ({
        noteIndex,
        time,
        color: RANDOM_COLOR(),
      }))
    );
  };

  const triggerNote = (noteIndex: number) => {
    playNote(notes[noteIndex][1]);
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

    const melodyData = [...notesPlayed].sort((a, b) => a.time - b.time);
    const freqMap = notes.map((n) => n[1]);

    if (isDrumEnabled) {
      stopDrumRef.current = playDrumLoop(tempo, () => {
        stopDrumRef.current = null;
      });
    }

    stopMelodyRef.current = playMelody(melodyData, tempo, freqMap, () => {
      stopDrumRef.current?.();
      setIsPlayingBack(false);
      setPlayIndex(null);
    });
  };

  const handleCanvasClick = (noteIdx: number, time: number) => {
    const updatedNotes = TOGGLE(notesPlayed, noteIdx, time);
    const updatedColors = TOGGLE_COLOR(colorMap, noteIdx, time);

    setNotesPlayed(updatedNotes);
    setColorMap(updatedColors);
    triggerNote(noteIdx);

    setNextTimeStep(time + 1);
  };

  const handleNotePlay = (noteIdx: number) => {
    const now = Date.now();
    if (now - lastTouchRef.current < 200) return; // skip duplicates
    lastTouchRef.current = now;

    triggerNote(noteIdx);
    chordBuffer.current.push(noteIdx);

    if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current);

    chordTimeoutRef.current = setTimeout(() => {
      const time = nextTimeStep;
      setNextTimeStep((prev) => (prev + 1) % SEQUENCER.STEPS);

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
    const songName = prompt('📝 Name your NFT:');
    if (!songName) return toast.error('Song name is required');

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
      toast.success('Song-art saved!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save NFT');
    }
  };

  const handleReset = () => {
      setNotesPlayed([]);
      setColorMap([]);
      setPlayIndex(null);
      stopPlayback();
      setNextTimeStep(0);
  }

  return (
    <>
      {!simple && <NFTSliderPanel nfts={nfts} collections={topCollections} />}

      <div style={{
        position: "fixed",
        inset: 0,
        borderRadius: 8,
        mixBlendMode: "overlay",
        opacity: 0.15,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      <div>
        {!simple && (
          <h2 style={{ textAlign: 'center' }}>
            <span className="glitch box">LAUNCHPAD</span>
          </h2>
        )}

        <br />
        <div style={{ textAlign: 'center', fontSize: '12px' }}>
          🎹 MIDI Device: <span style={{ color: midiConnected ? 'limegreen' : 'gray' }}>
            {midiConnected ? midiDeviceName : 'No device connected'}
          </span>
        </div>

        <section className={styles.musicBox}>
          <ControlsPanel
            isPlayingBack={isPlayingBack}
            tempo={tempo}
            setTempo={setTempo}
            onPlay={playback}
            onStop={stopPlayback}
            onReset={handleReset}
            onSave={saveNFTData}
            onOpenModal={() => setFreqModalOpen(true)}
            frequencyStyle={frequencyStyle}
            onIAGeneration={loadRandomMelody}
            openIAModal={() => setAIModalOpen(true)}
            isDrumEnabled={isDrumEnabled}
            setIsDrumEnabled={setIsDrumEnabled}
          />

          <div className={isPlayingBack ? "disabled" : undefined}
            style={{
              position: "relative",
              backgroundColor: "var(--black-color)",
              borderRadius: 8,
              height: '325px'
            }}
          >
            <PixelCanvas
              colorMap={colorMap}
              playingIndex={playIndex}
              color={frequencyStyle.color}
              onCanvasClick={handleCanvasClick}
            />
            <Piano onNotePlay={handleNotePlay} />
          </div>
        </section>
      </div>

      {isFreqModalOpen && (
        <FrequencyModal
          selected={selectedRange}
          onSelect={setSelectedRange}
          onSubmit={() => setFreqModalOpen(false)}
        />
      )}

      <Modal
        open={isAIModalOpen}
        onClose={() => setAIModalOpen(false)}
        showCloseIcon={false}
        styles={{
          modal: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            borderRadius: '10px',
            padding: '20px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
      >
        <button
          onClick={() => setAIModalOpen(false)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          &times;
        </button>

        <h2 style={{ color: 'var(--neon-color)', textAlign: 'center' }}>More options...</h2>

        <AIMelodyControls
          selectedScale={selectedScale}
          setSelectedScale={setSelectedScale}
          firstNote={firstNote}
          setFirstNote={setFirstNote}
          melodyKind={melodyKind}
          setMelodyKind={setMelodyKind}
          loadRandomMelody={loadRandomMelody}
          previewColorMap={notesPlayed.map(({ noteIndex, time }) => ({
            noteIndex,
            time,
            color: RANDOM_COLOR(),
          }))}
        />
      </Modal>
    </>
  );
}
