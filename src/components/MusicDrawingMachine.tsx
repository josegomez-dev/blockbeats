"use client";
import styles from "@/app/assets/styles/MainPage.module.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import NeonSlider from "./NeonSlider";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from '../context/AuthContext'
import Preloader from "./Preloader";

const notes: [string, number, string][] = [
  ["C1", 130.81, "kwhite"], ["CM1", 138.59, "kblack"],
  ["D1", 146.83, "kwhite"], ["DM1", 155.56, "kblack"],
  ["E1", 164.81, "kwhite"], ["F1", 174.61, "kwhite"],
  ["FM1", 185.0, "kblack"], ["G1", 196.0, "kwhite"],
  ["GM1", 207.65, "kblack"], ["A1", 220.0, "kwhite"],
  ["AM1", 233.08, "kblack"], ["B1", 246.94, "kwhite"],
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
        width: type === "kwhite" ? "40px" : "23px",
        height: type === "kwhite" ? "150px" : "95px",
        marginLeft: type === "kblack" ? "-12px" : "0",
        border: "1px solid black",
        display: "inline-block",
        position: type === "kblack" ? "absolute" : "relative",
        zIndex: type === "kblack" ? 2 : "auto",
        borderBottomLeftRadius: type === "kblack" ? "5px" : "0",
        borderBottomRightRadius: type === "kblack" ? "5px" : "0",
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

const PixelCanvas = ({
  colorMap,
  playingIndex,
  color,
  onCanvasClick,
}: {
  colorMap: { noteIndex: number; time: number; color: string }[];
  playingIndex: number | null;
  color: string;
  onCanvasClick: (noteIndex: number, time: number) => void;
}) => {
  const rows = notes.length;
  const cols = 24;
  const cellSize = 18;
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

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Adjust for scale between CSS size and actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const time = Math.floor(x / cellSize);
    const noteIndex = Math.floor(y / cellSize);

    onCanvasClick(noteIndex, time);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      width={cols * cellSize}
      height={rows * cellSize}
      style={{ margin: "0 auto", background: color, overflow: "auto", width: "100%", height: "auto", borderRadius: 8 }}
      id="pixel-canvas"
    />
  );
};

const FrequencyModal = ({ selected, onSelect, onSubmit }: { selected: string; onSelect: (name: string) => void; onSubmit: () => void }) => {
  const [sliderIndex, setSliderIndex] = useState(frequencyRanges.findIndex((r) => r.name === selected));

  useEffect(() => {
    if (sliderIndex >= 0 && sliderIndex < frequencyRanges.length) {
      onSelect(frequencyRanges[sliderIndex].name);
    }
  }, [sliderIndex]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)", color: "white", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        style={{
          backdropFilter: 'blur(50px)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          padding: 20,
          borderRadius: 10,
          textAlign: "center",
          width: "fit-content"
        }}
      >
        <Image src="/frequency-types.webp" alt="frequency types" width={350} height={350} style={{ maxWidth: "90%", height: "auto" }} />
        <br />
        <br />
        <input type="range" min={0} max={frequencyRanges.length - 1} value={sliderIndex} onChange={(e) => setSliderIndex(Number(e.target.value))} style={{ width: '100%' }} />
        <div style={{ fontSize: 18, color: frequencyRanges[sliderIndex].color }}>{frequencyRanges[sliderIndex].name}</div>
        <br />  
        <button type="submit" className={styles.submitBtn} style={{ animation: 'none', background: 'transparent', color: 'white' }}>Choose Freq.</button>
      </form>
    </div>
  );
};

const MusicDrawingPage = () => {
  const [notesPlayed, setNotesPlayed] = useState<{ noteIndex: number; time: number }[]>([]);
  const [colorMap, setColorMap] = useState<{ noteIndex: number; time: number; color: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Harmonic");
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [nfts, setNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;


  const saveNFTData = async () => {
    // ask for the name of the song
    const songName = prompt("Enter the name of the song:");
    if (!songName) {
      toast.error("Song name is required");
      return;
    }
    try {
      await addDoc(collection(db, "signatures"), {
        notesPlayed,
        colorMap,
        frequencyRange: selectedRange,
        createdAt: new Date(),
        createdBy: user?.uid,
        songName,
      });
      toast.success("Song-art saved successfully!");
    } catch (error) {
      console.error("Error saving NFT:", error);
      toast.error("Failed to save NFT");
    }
  };

  const handleCanvasClick = (noteIndex: number, time: number) => {
    setColorMap((prevMap) => {
      const exists = prevMap.find((n) => n.noteIndex === noteIndex && n.time === time);
      if (exists) {
        return prevMap.filter((n) => !(n.noteIndex === noteIndex && n.time === time));
      } else {
        const color = getRandomColor();
        return [...prevMap, { noteIndex, time, color }];
      }
    });

    setNotesPlayed((prevNotes) => {
      const exists = prevNotes.find((n) => n.noteIndex === noteIndex && n.time === time);
      if (exists) {
        return prevNotes.filter((n) => !(n.noteIndex === noteIndex && n.time === time));
      } else {
        return [...prevNotes, { noteIndex, time }];
      }
    });
  };

  const handleNotePlay = (noteIndex: number) => {
    const color = getRandomColor();
    setNotesPlayed((prev) => {
      const nextTime = prev.length % 24; // wrap around after 16 columns
      setColorMap((map) => [...map, { noteIndex, time: nextTime, color }]);
      return [...prev, { noteIndex, time: nextTime }];
    });
  };

  const resetBoard = () => {
    setNotesPlayed([]);
    setColorMap([]);
    setPlayIndex(null);
  };

  const playback = () => {
    setIsPlayingBack(true);
    let current = 0;
    const sorted = [...notesPlayed].sort((a, b) => a.time - b.time);
    const interval = setInterval(() => {
      if (current >= 24) {
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
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNFTs(nfts);
      setLoading(false);
      console.log("NFTs fetched:", nfts);
    };
    fetchNFTs();
  }, []);

  return (
    <>
      <div>
        <h2 className={styles.title}>🎧 Music Drawing Machine 🎹</h2>
        <div style={{ marginTop: "-50px" }}>
          {!loading ? 
            nfts.length > 0 ? (<NeonSlider slides={nfts} />) : (<p>
              <br />
              <br />
              <br />
              <br />
              <br />
              Please Register First NFT</p>) : <Preloader />}
        </div>
        <div className={styles.buttonsContainerMusicBox}>
          <button className={styles.submitBtn} style={{ background: 'transparent', color: 'white', animation: 'none' }}>🪙 Mint</button> &nbsp;&nbsp;
          <button className={styles.submitBtn} style={{ background: 'transparent', color: 'white', animation: 'none' }}>🔄 Trade</button> &nbsp;&nbsp;
        </div>

      </div>
                  
      <div style={{ padding: 0, borderRadius: 8, fontFamily: "monospace", color: "white", backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.1)', width: '300px', position: "relative", margin: "10px auto" }}>
        <br />
        <h3 style={{ color: frequencyStyle.color, textAlign: 'center', marginBottom: '0px' }}>BlockBeats <span data-text="NFT" className="glitch">NFT</span></h3>
        <hr />
        {/* Color overlay */}
        <div style={{ position: "fixed", borderRadius: 8, inset: 0, background: frequencyStyle.color, mixBlendMode: "overlay", opacity: 0.15, pointerEvents: "none", zIndex: 1 }} />

        {isModalOpen && (
          <FrequencyModal
            selected={selectedRange}
            onSelect={setSelectedRange}
            onSubmit={() => setIsModalOpen(false)}
          />
        )}

        <div style={{ margin: "0 auto", width: "auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ margin: '10px' }}>
            <button onClick={playback} disabled={isPlayingBack} className={styles.launchpadBtn}>▶️ Play</button> &nbsp;&nbsp;
            <button onClick={resetBoard} disabled={isPlayingBack} className={styles.launchpadBtn}>⚠️ Reset</button> &nbsp;&nbsp;
            <button onClick={saveNFTData} disabled={isPlayingBack} className={styles.launchpadBtn}>💾 Save</button>
          </div>

          <div style={{ background: "#111", padding: 10, margin: "0", position: "relative" }}>
            <span style={{ padding: "4px 8px", background: frequencyStyle.color, color: "#000", borderRadius: 4 }}>{frequencyStyle.name}</span>
            <button onClick={() => setIsModalOpen(true)} style={{ marginLeft: 25, animation: 'none' }}>🎚 Freq. Range</button>
          </div>

          <div style={{ position: "relative", backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <PixelCanvas
              colorMap={colorMap}
              playingIndex={playIndex}
              color={frequencyStyle.color}
              onCanvasClick={handleCanvasClick}
            />
            <Piano onNotePlay={handleNotePlay} />
            <div className={styles.melodyDataInfo} style={{ color: frequencyStyle.color }}>
              <div>
                {notesPlayed.length} <br /> notes played
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicDrawingPage;
