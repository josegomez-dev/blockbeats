import { AUDIO } from "../constants/musicDrawingMachine";

// utils/soundUtils.ts
const AudioContextGlobal = typeof window !== "undefined" ? window.AudioContext || (window as any).webkitAudioContext : null;
export const ctx = AudioContextGlobal ? new AudioContextGlobal() : null;

export const playNote = (
  noteFreq: number,
  duration: number = AUDIO.NOTE_LENGTH
) => {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  osc.frequency.value = noteFreq;
  osc.type = AUDIO.OSC_TYPE as OscillatorType;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const playDrumLoop = (tempo: number, onStop: () => void) => {
  if (!ctx) return null;

  const interval = (60 / tempo) * 1000;
  let count = 0;

  const kick = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const snare = () => {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    noise.connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.2);
  };

  const loop = setInterval(() => {
    if (count >= 24) {
      clearInterval(loop);
      onStop();
      return;
    }
    if (count % 4 === 0) kick();
    if (count % 4 === 2) snare();
    count++;
  }, interval);

  return () => clearInterval(loop); // return stop function
};

export const playMelody = (
  notesPlayed: { noteIndex: number; time: number }[],
  tempo: number,
  noteFreqMap: number[],
  onEnd?: () => void
) => {
  if (!ctx) return;

  let current = 0;
  const sorted = [...notesPlayed].sort((a, b) => a.time - b.time);
  const interval = (60 / tempo) * 1000;

  const loop = setInterval(() => {
    if (current >= 24) {
      clearInterval(loop);
      if (onEnd) onEnd();
      return;
    }

    const hits = sorted.filter((n) => n.time === current);
    hits.forEach(({ noteIndex }) => {
      playNote(noteFreqMap[noteIndex]);
    });

    current++;
  }, interval);

  return () => clearInterval(loop); // return stop function
};
