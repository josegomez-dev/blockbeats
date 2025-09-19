import { AUDIO, SEQUENCER } from "@/utils/constants/musicDrawingMachine";

const AudioContextGlobal =
  typeof window !== "undefined"
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;

export const ctx = AudioContextGlobal ? new AudioContextGlobal() : null;

/* ─────────────────────────────────────────────
   PLAY NOTE
───────────────────────────────────────────── */
export const playNote = (
  noteFreq: number,
  duration: number = AUDIO.NOTE_LENGTH,
  volume: number = 0.4
) => {
  if (!ctx) return;
  ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = AUDIO.OSC_TYPE as OscillatorType;
  osc.frequency.value = noteFreq;

  // Convert volume percentage (0-100) to gain value (0-1)
  const gainValue = Math.max(0, Math.min(1, volume / 100));
  
  gain.gain.setValueAtTime(gainValue, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + duration
  );

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

/* ─────────────────────────────────────────────
   PLAY DRUM LOOP
───────────────────────────────────────────── */
export const playDrumLoop = (
  tempo: number,
  onStop: () => void,
  steps: number = SEQUENCER.DRUM_PATTERN_REPEAT
) => {
  if (!ctx) return null;

  const interval = (60 / tempo) * 1000;
  let count = 0;

  const kick = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
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
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random();
    }
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(AUDIO.DRUM_VOLUME, ctx.currentTime);
    noise.connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + AUDIO.DRUM_LENGTH);
  };

  const loop = setInterval(() => {
    if (count >= steps) {
      clearInterval(loop);
      onStop();
      return;
    }
    if (count % 4 === 0) kick();
    if (count % 4 === 2) snare();
    count++;
  }, interval);

  return () => clearInterval(loop); // Return stop function
};

/* ─────────────────────────────────────────────
   PLAY MELODY
───────────────────────────────────────────── */
export const playMelody = (
  notesPlayed: { noteIndex: number; time: number }[],
  tempo: number,
  noteFreqMap: number[],
  onEnd?: () => void
) => {
  if (!ctx || !notesPlayed.length) return null;

  const sorted = [...notesPlayed].sort((a, b) => a.time - b.time);
  const interval = (60 / tempo) * 1000;
  let current = 0;

  const loop = setInterval(() => {
    if (current >= SEQUENCER.STEPS) {
      clearInterval(loop);
      if (onEnd) onEnd();
      return;
    }

    sorted
      .filter((n) => n.time === current)
      .forEach(({ noteIndex }) => playNote(noteFreqMap[noteIndex]));

    current++;
  }, interval);

  return () => clearInterval(loop); // Return stop function
};
