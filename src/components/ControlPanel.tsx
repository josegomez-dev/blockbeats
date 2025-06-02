// components/ControlsPanel.tsx
import React from 'react';
import styles from '@/app/assets/styles/MainPage.module.css';

interface Props {
  isPlayingBack: boolean;
  tempo: number;
  setTempo: (t: number) => void;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onSave: () => void;
  onOpenModal: () => void;
  frequencyStyle: { name: string; color: string };
}

const ControlsPanel: React.FC<Props> = ({
  isPlayingBack,
  tempo,
  setTempo,
  onPlay,
  onStop,
  onReset,
  onSave,
  onOpenModal,
  frequencyStyle,
}) => (
  <div className={`${isPlayingBack && 'disabled'}`} style={{ position: "relative", backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
    <div style={{ background: "#111", padding: 10, margin: "0", position: "relative" }}>
      <span style={{ padding: "4px 8px", background: frequencyStyle.color, color: "#000", borderRadius: 4 }}>{frequencyStyle.name}</span>
      <button onClick={onOpenModal} style={{ marginLeft: 25, animation: 'none' }}>🎚 Freq. Range</button>
    </div>
    <div style={{ textAlign: "center", marginTop: 10, marginBottom: '-10px' }}>
      {!isPlayingBack ? (
        <button onClick={onPlay} className={styles.launchpadBtn}>▶️ Play</button>
      ) : (
        <button onClick={onStop} className={styles.launchpadBtn}>⏹ Stop</button>
      )}
      &nbsp;&nbsp;
      <button onClick={onReset} disabled={isPlayingBack} className={styles.launchpadBtn}>⚠️ Reset</button>&nbsp;&nbsp;
      <button onClick={onSave} disabled={isPlayingBack} className={styles.launchpadBtn}>💾 Save</button>
      <br />
      <br />
    </div>
    {/* <div className={styles.melodyDataInfo} style={{ color: frequencyStyle.color, zIndex: 2, position: "relative", textAlign: "center" }}>
      <label>🎵 Tempo: {tempo} BPM 🥁</label>
      <input type="range" min={60} max={350} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
    </div> */}
  </div>
);

export default ControlsPanel;
