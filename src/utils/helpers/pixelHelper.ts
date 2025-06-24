
/* ────────────────────────── Helpers ───────────────────────── */
export const RANDOM = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const PICK_TWO = (arr: number[]): [number, number] => {
  const a = RANDOM(arr);
  let b = RANDOM(arr);
  while (b === a && arr.length > 1) b = RANDOM(arr);
  return [a, b];
};

export const TOGGLE = (
  list: { noteIndex: number; time: number }[],
  noteIdx: number,
  time: number
) =>
  list.some((n) => n.noteIndex === noteIdx && n.time === time)
    ? list.filter((n) => !(n.noteIndex === noteIdx && n.time === time))
    : [...list, { noteIndex: noteIdx, time }];

export const TOGGLE_COLOR = (
  list: { noteIndex: number; time: number; color: string }[],
  noteIdx: number,
  time: number
) =>
  list.some((c) => c.noteIndex === noteIdx && c.time === time)
    ? list.filter((c) => !(c.noteIndex === noteIdx && c.time === time))
    : [...list, { noteIndex: noteIdx, time, color: RANDOM_COLOR() }];

export const RANDOM_COLOR = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

