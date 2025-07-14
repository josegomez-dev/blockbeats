// ────────────────────────────────────────────────────────────────────────────────
// Music-Drawing Machine – Global Constants
// ────────────────────────────────────────────────────────────────────────────────

/** Audio-engine settings */
export const AUDIO = {
  OSC_TYPE: 'sawtooth',   // 'sine' | 'square' | 'sawtooth' | 'triangle'
  NOTE_LENGTH: 1,         // seconds
  DRUM_LENGTH: 0.2,       // seconds
  DRUM_VOLUME: 0.5,
};

/** Sequencer/grid settings (24 rows × 48 columns) */
export const SEQUENCER = {
  STEPS: 24,                 // ← now 24 horizontal time steps
  DEFAULT_TEMPO: 240,
  DRUM_PATTERN_REPEAT: 48,
};

/** UI dimensions */
export const UI = {
  MODAL_WIDTH: '90%',
  MODAL_MAX_WIDTH: '600px',
  ARROW_HINT_SIZE: 50,
};

// utils/constants/musicDrawingMachine.ts (or a new file)
export const keyMap = [
  'A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H', 'U', 'J',
  'K', 'O', 'L', 'P', ';', "'", 'Z', 'X', 'C', 'V', 'B', 'N'
];

// ────────────────────────────────────────────────────────────────────────────────
// NOTE TABLE  (C3-B4 → 24 keys, 2 full octaves)
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Each element:
 *  [0] Note label (C3, C#3 … B4)
 *  [1] Frequency in Hz
 *  [2] Key type ("kwhite" | "kblack") – used for piano styling
 */
export const notes: [string, number, 'kwhite' | 'kblack'][] = [];

/* White/black template for one octave */
const SEMITONES: [string, 'kwhite' | 'kblack'][] = [
  ['C',  'kwhite'],
  ['C#', 'kblack'],
  ['D',  'kwhite'],
  ['D#', 'kblack'],
  ['E',  'kwhite'],
  ['F',  'kwhite'],
  ['F#', 'kblack'],
  ['G',  'kwhite'],
  ['G#', 'kblack'],
  ['A',  'kwhite'],
  ['A#', 'kblack'],
  ['B',  'kwhite'],
];

/* Generate C3‒B4 (two octaves) */
for (let octave = 3; octave <= 4; octave++) {
  SEMITONES.forEach(([name, keyType], index) => {
    // distance in semitones from reference note A4 (index 9 in octave 4)
    const semitoneFromA4 = (octave - 4) * 12 + index - 9;
    const freq = 440 * Math.pow(2, semitoneFromA4 / 12);

    notes.push([`${name}${octave}`, +(freq.toFixed(2)), keyType]);
  });
}

// Log once in dev mode so you can be sure it’s 24 keys
if (process.env.NODE_ENV !== 'production') {
  console.log('🎹 Generated notes:', notes.map(([n]) => n), `(${notes.length})`);
}

// ────────────────────────────────────────────────────────────────────────────────
// Frequency-range presets (unchanged)
// ────────────────────────────────────────────────────────────────────────────────
export const frequencyRanges = [
  { name: 'Mono',       min: 0,    max: 800,  color: 'gray' },
  { name: 'Harmonic',   min: 1033, max: 1820, color: 'limegreen' },
  { name: 'Ornamental', min: 2041, max: 3240, color: 'dodgerblue' },
  { name: 'Fractal',    min: 3835, max: 4840, color: 'gold' },
  { name: 'Celestial',  min: 5201, max: 5907, color: 'violet' },
];

// Utility: random HSL for pixel-canvas cells
export const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

// AudioContext helper (web-audio polyfill)
export const AudioContext =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;
export const ctx = AudioContext ? new AudioContext() : null;

// ────────────────────────────────────────────────────────────────────────────────
// Typings & Scale tables (unchanged from your original file)
// ────────────────────────────────────────────────────────────────────────────────
export type KeyType = 'kwhite' | 'kblack';
export const keyTypes: KeyType[] = ['kwhite', 'kblack'];

export const SCALE_NAMES = [
  'ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian',
  'majorPentatonic','minorPentatonic','bluesMajor','bluesMinor',
  'harmonicMinor','melodicMinor','arabic','hungarianMinor','japaneseInSen',
  'egyptian','minor','pentatonic',
] as const;

export type ScaleName = typeof SCALE_NAMES[number];

export const scaleIntervals: Record<ScaleName, number[]> = {
  ionian:[0,2,4,5,7,9,11],
  dorian:[0,2,3,5,7,9,10],
  phrygian:[0,1,3,5,7,8,10],
  lydian:[0,2,4,6,7,9,11],
  mixolydian:[0,2,4,5,7,9,10],
  aeolian:[0,2,3,5,7,8,10],
  locrian:[0,1,3,5,6,8,10],
  majorPentatonic:[0,2,4,7,9],
  minorPentatonic:[0,3,5,7,10],
  bluesMajor:[0,2,3,4,7,9],
  bluesMinor:[0,3,5,6,7,10],
  harmonicMinor:[0,2,3,5,7,8,11],
  melodicMinor:[0,2,3,5,7,9,11],
  arabic:[0,2,4,5,6,8,10],
  hungarianMinor:[0,2,3,6,7,8,11],
  japaneseInSen:[0,1,5,7,10],
  egyptian:[0,2,5,7,10],
  // legacy aliases
  minor:[0,2,3,5,7,8,10],
  pentatonic:[0,2,4,7,9],
};

export const scaleDescriptions: Record<ScaleName,string> = {
  ionian:'Major scale',
  dorian:'Minor scale with raised 6th',
  phrygian:'Minor scale with flat 2nd',
  lydian:'Major scale with sharp 4th',
  mixolydian:'Major scale with flat 7th',
  aeolian:'Natural minor',
  locrian:'Minor scale with flat 2nd and 5th',
  majorPentatonic:'5-note major scale',
  minorPentatonic:'5-note minor scale',
  bluesMajor:'Major pentatonic with flat 3rd',
  bluesMinor:'Minor pentatonic with flat 5th',
  harmonicMinor:'Minor with raised 7th',
  melodicMinor:'Minor with raised 6th & 7th',
  arabic:'Middle Eastern scale',
  hungarianMinor:'Minor with augmented 4th',
  japaneseInSen:'Japanese 5-note scale',
  egyptian:'Exotic 5-note scale',
  minor:'Aeolian (natural minor)',
  pentatonic:'Major pentatonic',
};

export const midiNoteToFrequency = (note: number) => {
  return 440 * Math.pow(2, (note - 69) / 12); // A4 = MIDI 69 = 440Hz
};
