"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
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
import { SEQUENCER, AUDIO, UI } from "@/utils/constants/musicDrawingMachineSettings";

import FrequencyModal from "./FrequencyModal";
import PixelCanvas from "./PixelCanvas";
import Piano from "./Piano";
import NFTSliderPanel from "./NFTSliderPanel";
import ControlsPanel from "./ControlPanel";
import GalleryHeader from "./GalleryHeader";

import type { TopCollections } from "@/types/topCollections";

const AudioCtx = typeof window !== "undefined"
  ? window.AudioContext || (window as any).webkitAudioContext
  : null;
const ctx = AudioCtx ? new AudioCtx() : null;

const randomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

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
            const [a, b] = pickTwo(scaleIdx);
            melody.push({ noteIndex: a, time: t }, { noteIndex: b, time: t });
            break;
          }
          case "solo": {
            melody.push({ noteIndex: random(scaleIdx), time: t });
            break;
          }
          case "both": {
            melody.push({ noteIndex: random(scaleIdx), time: t });
            if (Math.random() < 0.25)
              melody.push({ noteIndex: random(scaleIdx), time: t });
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
        color: randomColor(),
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
    setNotesPlayed(toggle(notesPlayed, noteIdx, time));
    setColorMap(toggleColor(colorMap, noteIdx, time));
    triggerNote(noteIdx);
  };

  const handleNotePlay = (noteIdx: number) => {
    const nextTime = notesPlayed.length % SEQUENCER.STEPS;
    setNotesPlayed([...notesPlayed, { noteIndex: noteIdx, time: nextTime }]);
    setColorMap([
      ...colorMap,
      { noteIndex: noteIdx, time: nextTime, color: randomColor() },
    ]);
  };

  /* ─────────────────────── Persistence ──────────────────────── */
  const saveNFTData = async () => {
    const songName = prompt("📝 Name your NFT:");
    if (!songName) return toast.error("Song name is required");

    try {
      await addDoc(collection(db, "signatures"), {
        notesPlayed,
        colorMap,
        frequencyRange: selectedRange,
        createdAt: new Date(),
        createdBy: user?.uid,
        songName,
      });
      toast.success("Song-art saved!");
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
          // background: frequencyStyle.color,
          mixBlendMode: "overlay",
          opacity: 0.15,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Central music-box */}
      <section className={styles.musicBox}>
        {/* AI generator badge */}
        <AIHint onClick={() => setAIModalOpen(true)} />

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
        />

        {/* Canvas + piano */}
        <div
          className={isPlayingBack ? "disabled" : undefined}
          style={{
            position: "relative",
            backdropFilter: "blur(50px)",
            backgroundColor: "var(--black-color)",
            borderRadius: 8,
          }}
        >
          <PixelCanvas
            colorMap={colorMap}
            playingIndex={playIndex}
            color={frequencyStyle.color}
            onCanvasClick={handleCanvasClick}
          />
          <Piano onNotePlay={handleNotePlay} ctx={ctx} />
          <TempoSlider tempo={tempo} setTempo={setTempo} />
        </div>
      </section>

      {/* Frequency range modal */}
      {isFreqModalOpen && (
        <FrequencyModal
          selected={selectedRange}
          onSelect={setSelectedRange}
          onSubmit={() => setFreqModalOpen(false)}
        />
      )}

      {/* AI modal */}
      <Modal
        open={isAIModalOpen}
        onClose={() => setAIModalOpen(false)}
        showCloseIcon={false}
        styles={{
          overlay: { backgroundColor: "rgba(0,0,0,0.8)" },
          modal: {
            width: UI.MODAL_WIDTH,
            maxWidth: UI.MODAL_MAX_WIDTH,
            margin: "50px auto 0",
            backgroundColor: "rgba(0,0,0,0.1)",
            backdropFilter: "blur(50px)",
            borderRadius: 8,
            padding: 20,
            textAlign: "center",
          },
        }}
      >
        <GalleryHeader
          title="AI Melody Generator"
          onBackClick={() => setAIModalOpen(false)}
        />

        {/* AI content */}
        {/* <AIMelodyControls
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
            color: randomColor(),
          }))}
        /> */}
      </Modal>
    </>
  );
}

/* ────────────────────────── Helpers ───────────────────────── */
const random = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const pickTwo = (arr: number[]): [number, number] => {
  const a = random(arr);
  let b = random(arr);
  while (b === a && arr.length > 1) b = random(arr);
  return [a, b];
};

const toggle = (
  list: { noteIndex: number; time: number }[],
  noteIdx: number,
  time: number
) =>
  list.some((n) => n.noteIndex === noteIdx && n.time === time)
    ? list.filter((n) => !(n.noteIndex === noteIdx && n.time === time))
    : [...list, { noteIndex: noteIdx, time }];

const toggleColor = (
  list: { noteIndex: number; time: number; color: string }[],
  noteIdx: number,
  time: number
) =>
  list.some((c) => c.noteIndex === noteIdx && c.time === time)
    ? list.filter((c) => !(c.noteIndex === noteIdx && c.time === time))
    : [...list, { noteIndex: noteIdx, time, color: randomColor() }];

/* ─────────────────────── Small sub-components ────────────────────── */

function TempoSlider({
  tempo,
  setTempo,
}: {
  tempo: number;
  setTempo: (t: number) => void;
}) {
  return (
    <div
      style={{ textAlign: "center", color: "var(--neon-color)", marginTop: 4 }}
    >
      🎵 Tempo: {tempo} BPM
      <input
        type="range"
        min={60}
        max={420}
        value={tempo}
        onChange={(e) => setTempo(+e.target.value)}
        style={{ width: "80%" }}
      />
    </div>
  );
}

function AIHint({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        position: "relative",
        display: "inline-block",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: -UI.ARROW_HINT_SIZE,
          top: 0,
          fontSize: 12,
        }}
      >
        <Image
          src="/arrow-pink.gif"
          alt="IA arrow"
          width={UI.ARROW_HINT_SIZE}
          height={UI.ARROW_HINT_SIZE}
          style={{ filter: "drop-shadow(0 0 5px #ff00ff)", rotate: "90deg" }}
        />
      </span>
      <span
        style={{ position: "absolute", left: 50, top: 8, fontSize: 12 }}
      >
        IA&nbsp;Generator
      </span>
      <Image src="/logo.webp" alt="BlockBeats" width={50} height={50} />
    </div>
  );
}
