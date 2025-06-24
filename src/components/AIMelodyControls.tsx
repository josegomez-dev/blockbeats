"use client";

import React from "react";
import styles from "@/app/assets/styles/AIMelodyControls.module.css";
import { SCALE_NAMES, ScaleName } from "@/utils/constants/musicDrawingMachine";

interface Props {
  selectedScale: string;
  setSelectedScale: (scale: ScaleName) => void;
  firstNote: string;
  setFirstNote: (note: string) => void;
  melodyKind: "chords" | "solo" | "both";
  setMelodyKind: (kind: "chords" | "solo" | "both") => void;
  loadRandomMelody: () => void;
  previewColorMap: { noteIndex: number; time: number; color: string }[];
}

const AIMelodyControls: React.FC<Props> = ({
  selectedScale,
  setSelectedScale,
  firstNote,
  setFirstNote,
  melodyKind,
  setMelodyKind,
  loadRandomMelody,
}) => {
  const rootNotes = [
    "C1", "D1", "E1", "F1", "G1", "A1", "B1",
    "C2", "D2", "E2", "F2", "G2", "A2", "B2",
  ];

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.selectGroup}>
        <label>Root Note: </label>
        <select
          value={firstNote}
          onChange={(e) => setFirstNote(e.target.value)}
        >
          {rootNotes.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.selectGroup}>
        <label>🎶 Scale: </label>
        <select
          value={selectedScale}
          onChange={(e) => setSelectedScale(e.target.value as ScaleName)}
        >
          {SCALE_NAMES.map((scale) => (
            <option key={scale} value={scale}>
              {scale.charAt(0).toUpperCase() + scale.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.selectGroup}>
        <label>🎹 Select Mode: </label>
        <div style={{ fontSize: 12, padding: '5px 10px' }}>
          <label>
            <input
              type="radio"
              value="solo"
              checked={melodyKind === "solo"}
              onChange={() => setMelodyKind("solo")}
            /> &nbsp;
            Solo
          </label>
          &nbsp;&nbsp;&nbsp;
          <label>
            <input
              type="radio"
              value="chords"
              checked={melodyKind === "chords"}
              onChange={() => setMelodyKind("chords")}
            /> &nbsp;
            Chords
          </label>
          &nbsp;&nbsp;&nbsp;
          <label>
            <input
              type="radio"
              value="both"
              checked={melodyKind === "both"}
              onChange={() => setMelodyKind("both")}
            /> &nbsp;
            Both
          </label>
        </div>
      </div>

      <button className={styles.generateBtn} onClick={loadRandomMelody}>
        🚀 Generate Melody
      </button>
    </div>
  );
};

export default AIMelodyControls;
