"use client";
import styles from "@/app/assets/styles/MainPage.module.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const notes: [string, number, string][] = [
  ["C1", 130.81, "kwhite"],
  ["CM1", 138.59, "kblack"],
  ["D1", 146.83, "kwhite"],
  ["DM1", 155.56, "kblack"],
  ["E1", 164.81, "kwhite"],
  ["F1", 174.61, "kwhite"],
  ["FM1", 185.0, "kblack"],
  ["G1", 196.0, "kwhite"],
  ["GM1", 207.65, "kblack"],
  ["A1", 220.0, "kwhite"],
  ["AM1", 233.08, "kblack"],
  ["B1", 246.94, "kwhite"],
];

const frequencyRanges = [
  { name: "Mono", min: 0, max: 800, color: "gray" },
  { name: "Harmonic", min: 1033, max: 1820, color: "limegreen" },
  { name: "Ornamental", min: 2041, max: 3240, color: "dodgerblue" },
  { name: "Fractal", min: 3835, max: 4840, color: "gold" },
  { name: "Celestial", min: 5201, max: 5907, color: "violet" },
];

const AudioContext = typeof window !== "undefined" ? window.AudioContext || (window as any).webkitAudioContext : null;
const ctx = AudioContext ? new AudioContext() : null;

const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

const Key = ({ note, frequency, type, onPlay }: { note: string; frequency: number; type: string; onPlay: () => void }) => {
  const oscRef = useRef<OscillatorNode | null>(null);
  const play = () => {
    if (ctx && !oscRef.current) {
      const osc = ctx.createOscillator();
      osc.frequency.value = frequency;
      osc.type = "sawtooth";
      osc.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      onPlay();
    }
  };
  const stop = () => {
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
  };
  return (
    <div
      onMouseDown={play}
      onMouseUp={stop}
      onMouseOut={stop}
      onTouchStart={play}
      onTouchEnd={stop}
      style={{
        background: type === "kblack" ? "black" : "white",
        width: type === "kwhite" ? "40px" : "30px",
        height: type === "kwhite" ? "150px" : "85px",
        marginLeft: type === "kblack" ? "-15px" : "0",
        border: "1px solid black",
        display: "inline-block",
        position: type === "kblack" ? "absolute" : "relative",
        zIndex: type === "kblack" ? 2 : 1,
      }}
    ></div>
  );
};

const Piano = ({ onNotePlay }: { onNotePlay: (noteIndex: number) => void }) => (
  <div style={{ position: "relative", height: "200px" }}>
    {notes.map(([note, freq, type], i) => (
      <Key key={note} note={note} frequency={freq} type={type} onPlay={() => onNotePlay(i)} />
    ))}
  </div>
);

const PixelCanvas = ({ colorMap, playingIndex }: { colorMap: { noteIndex: number; time: number; color: string }[]; playingIndex: number | null }) => {
  const rows = notes.length;
  const cols = 16;
  const cellSize = 20;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#444";

    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, rows * cellSize);
      ctx.stroke();
    }

    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * cellSize);
      ctx.lineTo(cols * cellSize, j * cellSize);
      ctx.stroke();
    }

    for (const { noteIndex, time, color } of colorMap) {
      ctx.fillStyle = color;
      ctx.fillRect(time * cellSize, noteIndex * cellSize, cellSize, cellSize);
    }

    if (playingIndex !== null) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(playingIndex * cellSize, 0, cellSize, rows * cellSize);
    }
  }, [colorMap, playingIndex]);

  return <canvas ref={canvasRef} width={cols * cellSize} height={rows * cellSize} style={{ margin: "0 auto", background: "#111" }} id="pixel-canvas" />;
};

const FrequencyModal = ({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) => (
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", color: "white", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
    <div style={{ backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: 20, borderRadius: 10,  margin: "0 auto", textAlign: "center", width: "fit-content" }}>
      <Image
        style={{ maxWidth: "90%", height: "auto" }}
        src={'/frequency-types.png'}
        alt={'frequency types'}
        width={350}
        height={350}
      />
      <br />
      <br />
      <h3 style={{ textAlign: 'center' }}>Select Frequency Range</h3>
      <br />
      {frequencyRanges.map((r) => (
        <label key={r.name} style={{ display: "block", margin: "10px 0", textTransform: "uppercase", textAlign: "left", fontSize: 18 } }>
          <input type="radio" name="freq" value={r.name} checked={selected === r.name} onChange={() => onSelect(r.name)} />
          <span style={{ color: r.color, marginLeft: 8 }}>{r.name}</span>
        </label>
      ))}
    </div>
  </div>
);

const MusicDrawingPage = () => {
  const [notesPlayed, setNotesPlayed] = useState<{ noteIndex: number; time: number }[]>([]);
  const [colorMap, setColorMap] = useState<{ noteIndex: number; time: number; color: string }[]>([]);
  const [timeStep, setTimeStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedRange, setSelectedRange] = useState("Harmonic");
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playIndex, setPlayIndex] = useState<number | null>(null);

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;

  const resetBoard = () => {
    setNotesPlayed([]);
    setColorMap([]);
    setPlayIndex(null);
  };

  const handleNotePlay = (noteIndex: number) => {
    const color = getRandomColor();
    setNotesPlayed((prev) => [...prev, { noteIndex, time: timeStep }]);
    setColorMap((prev) => [...prev, { noteIndex, time: timeStep, color }]);
  };

  const downloadCanvas = () => {
    const canvas = document.getElementById("pixel-canvas") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "blockbeats-nft.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const playback = () => {
    setIsPlayingBack(true);
    let current = 0;
    const sorted = [...notesPlayed].sort((a, b) => a.time - b.time);
    const interval = setInterval(() => {
      if (current >= 16) {
        clearInterval(interval);
        setPlayIndex(null);
        setIsPlayingBack(false);
        return;
      }
      setPlayIndex(current);
      const hits = sorted.filter((n) => n.time === current);
      hits.forEach(({ noteIndex }) => {
        const osc = ctx?.createOscillator();
        if (osc) {
          osc.frequency.value = notes[noteIndex][1];
          osc.type = "sawtooth";
          osc.connect(ctx!.destination);
          osc.start();
          osc.stop(ctx!.currentTime + 0.2);
        }
      });
      current++;
    }, 400);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStep((prev) => (prev + 1) % 16);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="moving-border" style={{ padding: 20, fontFamily: "monospace", color: "white", backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.1)', width: '400px', position: "relative", margin: "0 auto" }}>
      {/* Color overlay filter */}
      <div style={{ position: "fixed", inset: 0, background: frequencyStyle.color, mixBlendMode: "overlay", opacity: 0.15, pointerEvents: "none", zIndex: 1 }} />
      {isModalOpen && 
        <FrequencyModal 
          selected={selectedRange} 
          onSelect={(name) => { setSelectedRange(name); setIsModalOpen(false); toast.success(`Selected ${name} frequency range!`, { icon: '🎚️' }) }}
        />}
      <div style={{ margin: "0 auto", width: "fit-content", textAlign: "center", zIndex: 2 }}> 
        <h2 style={{ color: frequencyStyle.color }}>🎧 BlockBeats <span data-text="NFT" className="glitch">NFT</span> Piano 🎹</h2>
        <br />
        <div>
            <button onClick={playback} disabled={isPlayingBack} className={styles.launchpadBtn}>▶️ Play</button>
            &nbsp;
            &nbsp;
            <button onClick={resetBoard} disabled={isPlayingBack} className={styles.launchpadBtn}>⚠️ Reset</button>        
        </div>

        <br />          
        <div style={{ position: "relative", zIndex: 2, backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <PixelCanvas colorMap={colorMap} playingIndex={playIndex} />
          <br />
          <Piano onNotePlay={handleNotePlay} />
        </div>

        <div style={{ background: "#111", padding: 10, marginTop: -50, zIndex: 2, position: "relative", borderRadius: 10 }}>
            <div>
                <span style={{ marginLeft: 10, padding: "4px 8px", background: frequencyStyle.color, color: "#000", borderRadius: 4 }}>{frequencyStyle.name}</span>
                <button onClick={() => setIsModalOpen(true)} className={styles.submitBtn} style={{ marginLeft: 25, background: 'transparent', animation: 'none'  }}>🎚 Freq. Range:</button>
            </div>
        </div>
        {/* <div style={{ marginTop: -50 }}>
            <button disabled className={`${styles.submitBtn} ${'disabled'}`} onClick={downloadCanvas}>🖼 Save NFT</button>
            &nbsp;
            &nbsp;
            <button disabled className={`${styles.submitBtn} ${'disabled'}`} onClick={() => alert("Shared!")}>🔗 Share</button>
        </div> */}
      </div>
    </div>
  );
};

export default MusicDrawingPage;