// components/ControlsPanel.tsx
import React from 'react';
import styles from '@/app/assets/styles/MainPage.module.css';
import { LuFullscreen } from "react-icons/lu";
import Modal from 'react-responsive-modal';
import AIMelodyControls from './AIMelodyControls';
import { useRouter } from 'next/router';

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
  onIAGeneration?: () => void; // Optional prop for AI generation
  openIAModal?: () => void; // Optional prop to control modal visibility
  isDrumEnabled?: boolean; // Optional prop to control drum state
  setIsDrumEnabled?: React.Dispatch<React.SetStateAction<boolean>>; // Optional prop to set drum state
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
  onIAGeneration = () => {}, // Default to a no-op function if not provided
  openIAModal = () => {}, // Default to false if not provided
  isDrumEnabled = false, // Default to false if not provided
  setIsDrumEnabled = () => {}, // Default to a no-op function if not
}) => {

  const router = useRouter();

  return (
    <div className={`${isPlayingBack && 'disabled'}`} style={{ position: "relative", backdropFilter: 'blur(50px)', backgroundColor: 'var(--black-color)', borderRadius: 6, margin: "0 auto", boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
      <div style={{ textAlign: "center", padding: 10, margin: "0", position: "relative" }}>
        <button onClick={() => router.push('/studio')} className='glitch' style={{ position: 'absolute', fontSize: 12, left: '10px', top: 14, background: 'transparent', border: "none", cursor: 'pointer' }}>
          <LuFullscreen style={{ fontSize: 16, color: 'var(--neon-color)' }} />
        </button>

        <button onClick={onIAGeneration} className={styles.launchpadBtn}>
          🤖 Generate Progression
        </button>
        <button onClick={openIAModal} className='glitch' style={{ position: 'absolute', fontSize: 12, right: '10px', top: 14, background: 'transparent', border: "none", cursor: 'pointer' }}>
          ...
        </button>
      </div>
      <hr />
      {/* <div style={{ background: "#111", padding: 10, margin: "0", position: "relative" }}>
        <span style={{ padding: "4px 8px", background: frequencyStyle.color, color: "#000", borderRadius: 4 }}>{frequencyStyle.name}</span>
        <button onClick={onOpenModal} style={{ marginLeft: 25, animation: 'none', background: 'transparent', border: 'none', cursor: 'pointer' }}>🎚 Edit Range</button>
      </div> */}

      <div style={{ textAlign: "center", marginBottom: '-15px' }}>
        {!isPlayingBack ? (
          <button onClick={onPlay} className={styles.launchpadBtn}>▶️ Play</button>
        ) : (
          <button onClick={onStop} className={styles.launchpadBtn}>⏹ Stop</button>
        )}
        &nbsp;&nbsp;
        <button onClick={() => setIsDrumEnabled((prev: boolean) => !prev)} disabled={isPlayingBack} className={styles.launchpadBtn}>{isDrumEnabled ? '🥁 Drum On' : '🚫 Drum Off'}</button>&nbsp;&nbsp;
        <button onClick={onReset} disabled={isPlayingBack} className={styles.launchpadBtn}>⚠️ Reset</button>&nbsp;&nbsp;
        <button onClick={onSave} disabled={isPlayingBack} className={styles.launchpadBtn}>💾 Save</button>
      </div>

      <br />

      {/* <div style={{ textAlign: "center", color: "var(--neon-color)", fontSize: 12 }}>
        🎵 Tempo: {tempo} BPM
        <input
          type="range"
          min={60}
          max={420}
          value={tempo}
          onChange={(e) => setTempo(+e.target.value)}
          style={{ width: "80%", cursor: "pointer", marginBottom: 10 }}
        />
      </div> */}

    </div>
  )
};

export default ControlsPanel;
