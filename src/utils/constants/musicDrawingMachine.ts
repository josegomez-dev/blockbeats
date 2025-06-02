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