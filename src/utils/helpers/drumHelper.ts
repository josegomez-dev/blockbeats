import { AUDIO, SEQUENCER } from "@/utils/constants/musicDrawingMachine";

const AudioContextGlobal =
  typeof window !== "undefined"
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;

// Create audio context lazily to avoid issues with browser autoplay policies
let _ctx: AudioContext | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (!AudioContextGlobal) return null;
  
  if (!_ctx) {
    _ctx = new AudioContextGlobal();
  }
  
  return _ctx;
};

export const ctx = getAudioContext();

/* ─────────────────────────────────────────────
   PLAY NOTE
───────────────────────────────────────────── */
export const playNote = (
  noteFreq: number,
  duration: number = AUDIO.NOTE_LENGTH,
  volume: number = 40 // Default to 40% volume
) => {
  const audioCtx = getAudioContext();
  if (!audioCtx) {
    console.warn('Audio context not available');
    return;
  }
  
  // Resume audio context if suspended (required for user interaction)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = AUDIO.OSC_TYPE as OscillatorType;
  osc.frequency.value = noteFreq;

  // Convert volume percentage (0-100) to gain value (0-1)
  const gainValue = Math.max(0, Math.min(1, volume / 100));
  
  gain.gain.setValueAtTime(gainValue, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

/* ─────────────────────────────────────────────
   PLAY DRUM LOOP
───────────────────────────────────────────── */
export const playDrumLoop = (
  tempo: number,
  onStop: () => void,
  steps: number = SEQUENCER.DRUM_PATTERN_REPEAT
) => {
  const audioCtx = getAudioContext();
  if (!audioCtx) {
    console.warn('Audio context not available for drum loop');
    return null;
  }

  // Resume audio context if suspended
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  const interval = (60 / tempo) * 1000;
  let count = 0;

  const kick = () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + AUDIO.DRUM_LENGTH
    );
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + AUDIO.DRUM_LENGTH);
  };

  const snare = () => {
    const noise = audioCtx.createBufferSource();
    const buffer = audioCtx.createBuffer(
      1,
      audioCtx.sampleRate * AUDIO.DRUM_LENGTH,
      audioCtx.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random();
    }
    noise.buffer = buffer;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(AUDIO.DRUM_VOLUME, audioCtx.currentTime);
    noise.connect(gain).connect(audioCtx.destination);
    noise.start();
    noise.stop(audioCtx.currentTime + AUDIO.DRUM_LENGTH);
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
  const audioCtx = getAudioContext();
  if (!audioCtx) {
    console.warn('Audio context not available for melody playback');
    return null;
  }
  
  if (!notesPlayed.length) {
    console.warn('No notes to play');
    return null;
  }

  if (!noteFreqMap.length) {
    console.warn('No frequency map provided');
    return null;
  }

  // Resume audio context if suspended
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(console.error);
  }

  const sorted = [...notesPlayed].sort((a, b) => a.time - b.time);
  const interval = (60 / tempo) * 1000;
  let current = 0;

  console.log('Starting melody playback:', {
    notesCount: sorted.length,
    tempo,
    interval,
    maxSteps: SEQUENCER.STEPS
  });

  const loop = setInterval(() => {
    if (current >= SEQUENCER.STEPS) {
      clearInterval(loop);
      console.log('Melody playback completed');
      if (onEnd) onEnd();
      return;
    }

    const notesAtCurrentTime = sorted.filter((n) => n.time === current);
    
    if (notesAtCurrentTime.length > 0) {
      console.log(`Playing ${notesAtCurrentTime.length} notes at step ${current}`);
    }

    notesAtCurrentTime.forEach(({ noteIndex }) => {
      // Validate note index
      if (noteIndex >= 0 && noteIndex < noteFreqMap.length) {
        const frequency = noteFreqMap[noteIndex];
        if (frequency && frequency > 0) {
          playNote(frequency, AUDIO.NOTE_LENGTH, 50); // 50% volume for melody
        } else {
          console.warn(`Invalid frequency for note index ${noteIndex}: ${frequency}`);
        }
      } else {
        console.warn(`Note index ${noteIndex} out of bounds (0-${noteFreqMap.length - 1})`);
      }
    });

    current++;
  }, interval);

  return () => {
    console.log('Stopping melody playback');
    clearInterval(loop);
  }; // Return stop function
};
