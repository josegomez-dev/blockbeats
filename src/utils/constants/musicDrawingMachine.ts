export const notes: [string, number, string][] = [
  ["C1", 130.81, "kwhite"], ["CM1", 138.59, "kblack"],
  ["D1", 146.83, "kwhite"], ["DM1", 155.56, "kblack"],
  ["E1", 164.81, "kwhite"], ["F1", 174.61, "kwhite"],
  ["FM1", 185.0, "kblack"], ["G1", 196.0, "kwhite"],
  ["GM1", 207.65, "kblack"], ["A1", 220.0, "kwhite"],
  ["AM1", 233.08, "kblack"], ["B1", 246.94, "kwhite"],
];

export const frequencyRanges = [
  { name: "Mono", min: 0, max: 800, color: "gray" },
  { name: "Harmonic", min: 1033, max: 1820, color: "limegreen" },
  { name: "Ornamental", min: 2041, max: 3240, color: "dodgerblue" },
  { name: "Fractal", min: 3835, max: 4840, color: "gold" },
  { name: "Celestial", min: 5201, max: 5907, color: "violet" },
];

export const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

export const AudioContext =
  typeof window !== "undefined"
    ? window.AudioContext || (window as any).webkitAudioContext
    : null;

export const ctx = AudioContext ? new AudioContext() : null;

export type KeyType = 'kwhite' | 'kblack';
export const keyTypes: KeyType[] = ['kwhite', 'kblack'];

export const SCALE_NAMES = [
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
  'majorPentatonic',
  'minorPentatonic',
  'bluesMajor',
  'bluesMinor',
  'harmonicMinor',
  'melodicMinor',
  'arabic',
  'hungarianMinor',
  'japaneseInSen',
  'egyptian',
  'minor',
  'pentatonic'
] as const;

export type ScaleName = typeof SCALE_NAMES[number];

export const scaleIntervals: Record<ScaleName, number[]> = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],

  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],

  bluesMajor: [0, 2, 3, 4, 7, 9],
  bluesMinor: [0, 3, 5, 6, 7, 10],

  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],

  arabic: [0, 2, 4, 5, 6, 8, 10],
  hungarianMinor: [0, 2, 3, 6, 7, 8, 11],
  japaneseInSen: [0, 1, 5, 7, 10],
  egyptian: [0, 2, 5, 7, 10],

  // Legacy compatibility keys
  minor: [0, 2, 3, 5, 7, 8, 10],       // same as aeolian
  pentatonic: [0, 2, 4, 7, 9],         // same as majorPentatonic
};


export const scaleDescriptions: Record<ScaleName, string> = {
  ionian: "Major scale",
  dorian: "Minor scale with raised 6th",
  phrygian: "Minor scale with flat 2nd",
  lydian: "Major scale with sharp 4th",
  mixolydian: "Major scale with flat 7th",
  aeolian: "Natural minor",
  locrian: "Minor scale with flat 2nd and 5th",

  majorPentatonic: "5-note major scale",
  minorPentatonic: "5-note minor scale",
  bluesMajor: "Major pentatonic with flat 3rd",
  bluesMinor: "Minor pentatonic with flat 5th",

  harmonicMinor: "Minor with raised 7th",
  melodicMinor: "Minor with raised 6th and 7th",
  arabic: "Middle Eastern scale",
  hungarianMinor: "Minor scale with augmented 4th",
  japaneseInSen: "Japanese 5-note scale",
  egyptian: "Exotic 5-note scale",

  minor: "Aeolian (natural minor)",
  pentatonic: "Major pentatonic",
};
