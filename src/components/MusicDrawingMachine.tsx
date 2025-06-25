"use client";

import { useRef, useState, useCallback } from "react";
import Modal from "react-responsive-modal";
import toast from "react-hot-toast";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "@/context/AuthContext";

import styles from "@/app/assets/styles/MainPage.module.css";
import {
  frequencyRanges,
  notes,
  scaleIntervals,
  ScaleName,
} from "@/utils/constants/musicDrawingMachine";
import { SEQUENCER, AUDIO } from "@/utils/constants/musicDrawingMachine";

import FrequencyModal from "./FrequencyModal";
import PixelCanvas from "./PixelCanvas";
import Piano from "./Piano";
import NFTSliderPanel from "./NFTSliderPanel";
import ControlsPanel from "./ControlPanel";

import type { TopCollections } from "@/types/topCollections";
import AIMelodyControls from "./AIMelodyControls";
import { PICK_TWO, RANDOM, RANDOM_COLOR, TOGGLE, TOGGLE_COLOR } from "@/utils/helpers/pixelHelper";

import { v4 as uuidv4 } from "uuid";

const AudioCtx = typeof window !== "undefined"
  ? window.AudioContext || (window as any).webkitAudioContext
  : null;
const ctx = AudioCtx ? new AudioCtx() : null;

interface Props {
  nfts?: any[];
  topCollections?: TopCollections[];
}

export default function MusicDrawingPage({
  nfts = [],
  topCollections = [],
}: Props) {
  /* ────────────────────────── State ────────────────────────── */
  const { user } = useAuth();

  const [notesPlayed, setNotesPlayed] = useState<
    { noteIndex: number; time: number }[]
  >([]);
  const [colorMap, setColorMap] = useState<
    { noteIndex: number; time: number; color: string }[]
  >([]);

  const [selectedRange, setSelectedRange] = useState("Harmonic");
  const [selectedScale, setSelectedScale] = useState<ScaleName>("minor");
  const [melodyKind, setMelodyKind] = useState<"chords" | "solo" | "both">(
    "both"
  );
  const [firstNote, setFirstNote] = useState("C1");

  const [tempo, setTempo] = useState(SEQUENCER.DEFAULT_TEMPO);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playIndex, setPlayIndex] = useState<number | null>(null);

  const [isFreqModalOpen, setFreqModalOpen] = useState(false);
  const [isAIModalOpen, setAIModalOpen] = useState(false);

  const playbackRef = useRef<NodeJS.Timeout | null>(null);
  const drumRef = useRef<NodeJS.Timeout | null>(null);

  const frequencyStyle = frequencyRanges.find(
    (r) => r.name === selectedRange
  )!;

  /* ───────────────────── Melody generation ──────────────────── */
  const generateRandomMelody = useCallback(() => {
    const melody: { noteIndex: number; time: number }[] = [];
    const baseIdx = notes.findIndex(([n]) => n === firstNote);
    const intervals = scaleIntervals[selectedScale];

    if (baseIdx === -1 || !intervals) return melody;

    const scaleIdx = intervals.map((i) => (baseIdx + i) % notes.length);
    const usedTimes = new Set<number>();

    for (let t = 0; t < SEQUENCER.STEPS; t++) {
      if (Math.random() < 0.6 && !usedTimes.has(t)) {
        usedTimes.add(t);

        switch (melodyKind) {
          case "chords": {
            const [a, b] = PICK_TWO(scaleIdx);
            melody.push({ noteIndex: a, time: t }, { noteIndex: b, time: t });
            break;
          }
          case "solo": {
            melody.push({ noteIndex: RANDOM(scaleIdx), time: t });
            break;
          }
          case "both": {
            melody.push({ noteIndex: RANDOM(scaleIdx), time: t });
            if (Math.random() < 0.25)
              melody.push({ noteIndex: RANDOM(scaleIdx), time: t });
            break;
          }
        }
      }
    }
    return melody;
  }, [firstNote, selectedScale, melodyKind]);

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

  /* ────────────────────────── Drums ─────────────────────────── */
  const playDrumLoop = useCallback(() => {
    if (!ctx) return;
    stopDrums();

    let count = 0;
    const interval = (60 / tempo) * 1000;

    const kick = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + AUDIO.DRUM_LENGTH
      );
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + AUDIO.DRUM_LENGTH);
    };

    const snare = () => {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(
        1,
        ctx.sampleRate * AUDIO.DRUM_LENGTH,
        ctx.sampleRate
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random();
      noise.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(AUDIO.DRUM_VOLUME, ctx.currentTime);
      noise.connect(gain).connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + AUDIO.DRUM_LENGTH);
    };

    const loop = setInterval(() => {
      if (count >= SEQUENCER.DRUM_PATTERN_REPEAT) {
        stopDrums();
        return;
      }
      if (count % 4 === 0) kick();
      if (count % 4 === 2) snare();
      count++;
    }, interval);

    drumRef.current = loop;
  }, [tempo]);

  const stopDrums = useCallback(() => {
    if (drumRef.current) clearInterval(drumRef.current);
    drumRef.current = null;
  }, []);

  /* ───────────────────────── Playback ───────────────────────── */
  const stopPlayback = useCallback(() => {
    if (playbackRef.current) clearInterval(playbackRef.current);
    setIsPlayingBack(false);
    setPlayIndex(null);
    stopDrums();
  }, [stopDrums]);

  const playback = () => {
    if (!notesPlayed.length) return toast("Nothing to play!");
    setIsPlayingBack(true);
    playDrumLoop();

    const sorted = [...notesPlayed].sort((a, b) => a.time - b.time);
    const interval = (60 / tempo) * 1000;
    let current = 0;

    playbackRef.current = setInterval(() => {
      if (current >= SEQUENCER.STEPS) return stopPlayback();

      setPlayIndex(current);
      sorted
        .filter((n) => n.time === current)
        .forEach(({ noteIndex }) => triggerNote(noteIndex));

      current++;
    }, interval);
  };

  /* ─────────────────────── Note handlers ────────────────────── */
  const triggerNote = (noteIndex: number) => {
    if (!ctx) return;
    ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = AUDIO.OSC_TYPE as OscillatorType;
    osc.frequency.value = notes[noteIndex][1];
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + AUDIO.NOTE_LENGTH
    );

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + AUDIO.NOTE_LENGTH);
  };

  const handleCanvasClick = (noteIdx: number, time: number) => {
    setNotesPlayed(TOGGLE(notesPlayed, noteIdx, time));
    setColorMap(TOGGLE_COLOR(colorMap, noteIdx, time));
    triggerNote(noteIdx);
  };

  const handleNotePlay = (noteIdx: number) => {
    const nextTime = notesPlayed.length % SEQUENCER.STEPS;
    setNotesPlayed([...notesPlayed, { noteIndex: noteIdx, time: nextTime }]);
    setColorMap([
      ...colorMap,
      { noteIndex: noteIdx, time: nextTime, color: RANDOM_COLOR() },
    ]);
  };

  /* ─────────────────────── Persistence ──────────────────────── */
  const saveNFTData = async () => {
    const songName = prompt("📝 Name your NFT:");
    if (!songName) return toast.error("Song name is required");

    try {
      await addDoc(collection(db, "signatures"), {
        songName,
        notesPlayed,
        colorMap,
        frequencyRange: selectedRange,
        color: frequencyStyle.color, // Save the color based on frequency
        tempo,                       // Save the current tempo
        createdAt: new Date(),
        createdBy: user?.uid,
        id: uuidv4(), // Unique ID
      });
      toast.success("Song-art saved!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save NFT");
    }
  };

  /* ─────────────────────────── UI ──────────────────────────── */
  return (
    <>
      {/* Slider panel */}
      <NFTSliderPanel nfts={nfts} collections={topCollections} />

      {/* Frequency overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          borderRadius: 8,
          mixBlendMode: "overlay",
          opacity: 0.15,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Central music-box */}
      <div>
        <h4 style={{ textAlign: 'center' }}>
          <span className="glitch">LAUNCHPAD</span>
          &nbsp;Musical&nbsp;
          <span className="glitch">NFTs</span>
        </h4>
        <section className={styles.musicBox} style={{ background: frequencyStyle.color }}>

          {/* Control panel */}
          <ControlsPanel
            isPlayingBack={isPlayingBack}
            tempo={tempo}
            setTempo={setTempo}
            onPlay={playback}
            onStop={stopPlayback}
            onReset={() => {
              setNotesPlayed([]);
              setColorMap([]);
              setPlayIndex(null);
              stopDrums();
            }}
            onSave={saveNFTData}
            onOpenModal={() => setFreqModalOpen(true)}
            frequencyStyle={frequencyStyle}
            onIAGeneration={loadRandomMelody}
            openIAModal={() => setAIModalOpen(true)}
          />

          {/* Canvas + piano */}
          <div
            className={isPlayingBack ? "disabled" : undefined}
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
            <Piano onNotePlay={handleNotePlay} ctx={ctx} />
          </div>
        </section>
      </div>

      {/* Frequency range modal */}
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
        // frequencyStyle={frequencyStyle}
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
        {/* Add your form or controls here */}
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