"use client";
import styles from "@/app/assets/styles/MainPage.module.css";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from '../context/AuthContext'
import FrequencyModal from "./FrequencyModal";
import { frequencyRanges, notes, SCALE_NAMES, scaleDescriptions, scaleIntervals, ScaleName } from "@/utils/constants/musicDrawingMachine";
import PixelCanvas from "./PixelCanvas";
import Piano from "./Piano";
import NFTSliderPanel from "./NFTSliderPanel";
import ControlsPanel from "./ControlPanel";
import Modal from "react-responsive-modal";
import Image from "next/image";
import PixelPreview from "./PixelPreview";

const AudioContext = typeof window !== "undefined" ? window.AudioContext || (window as any).webkitAudioContext : null;
const ctx = AudioContext ? new AudioContext() : null;

const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

const MusicDrawingPage = () => {
  const [notesPlayed, setNotesPlayed] = useState<{ noteIndex: number; time: number }[]>([]);
  const [colorMap, setColorMap] = useState<{ noteIndex: number; time: number; color: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Harmonic");
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [nfts, setNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIAGeneratorOpen, setIsIAGeneratorOpen] = useState(false);

  const [selectedScale, setSelectedScale] = useState<ScaleName>('minor'); // default scale

  const [melodyKind, setMelodyKind] = useState<'chords' | 'solo' | 'both'>('both');
  const [firstNote, setFirstNote] = useState<string>('C1'); // default

  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const drumIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();

  const frequencyStyle = frequencyRanges.find((r) => r.name === selectedRange)!;

  const [tempo, setTempo] = useState(350);
  const [drumLoop, setDrumLoop] = useState<(() => void) | null>(null);

  const playDrumLoop = (tempo: number, drumIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (!ctx) return;

    const interval = (60 / tempo) * 1000; // ms per beat
    let count = 0;

    const kick = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    };

    const snare = () => {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random();
      noise.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      noise.connect(gain).connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.2);
    };

    const loop = setInterval(() => {
      if (count >= 24) {
        clearInterval(loop);
        drumIntervalRef.current = null;
        return;
      }

      if (count % 4 === 0) kick();
      if (count % 4 === 2) snare();
      count++;
    }, interval);


    drumIntervalRef.current = loop;

    return () => {
      clearInterval(loop);
      drumIntervalRef.current = null;
    };
  };

  const startDrums = () => {
    stopDrums(); // always stop any running loop
    const stopFn = playDrumLoop(tempo, drumIntervalRef);
    setDrumLoop(() => stopFn);
  };

  const stopDrums = () => {
    if (drumLoop) {
      drumLoop(); // clears the interval
      setDrumLoop(null);
    }
    if (drumIntervalRef.current) {
      clearInterval(drumIntervalRef.current);
      drumIntervalRef.current = null;
    }
  };


  const generateRandomMelody = (): { noteIndex: number; time: number }[] => {
  const steps = 24;
  const melody: { noteIndex: number; time: number }[] = [];
  const usedTimes = new Set<number>();

  // Get the index of the selected base/root note
  const baseIndex = notes.findIndex(([name]) => name === firstNote);
  if (baseIndex === -1) return melody;

  // Get selected scale intervals and map to note indices
  const intervals = scaleIntervals[selectedScale];
  if (!intervals) return melody;

  const scaleNoteIndices = intervals
    .map(interval => (baseIndex + interval) % notes.length)
    .filter(index => index >= 0 && index < notes.length); // safety check

  for (let time = 0; time < steps; time++) {
    if (Math.random() < 0.6 && !usedTimes.has(time)) {
      usedTimes.add(time);

      switch (melodyKind) {
        case 'chords': {
          // Always generate two different notes at the same time
          const idx1 = Math.floor(Math.random() * scaleNoteIndices.length);
          let idx2 = Math.floor(Math.random() * scaleNoteIndices.length);
          while (idx2 === idx1 && scaleNoteIndices.length > 1) {
            idx2 = Math.floor(Math.random() * scaleNoteIndices.length);
          }
          melody.push({ noteIndex: scaleNoteIndices[idx1], time });
          melody.push({ noteIndex: scaleNoteIndices[idx2], time });
          break;
        }

        case 'solo': {
          // Only a single note
          const noteIndex = scaleNoteIndices[Math.floor(Math.random() * scaleNoteIndices.length)];
          melody.push({ noteIndex, time });
          break;
        }

        case 'both': {
          // Always a single note
          const baseNote = scaleNoteIndices[Math.floor(Math.random() * scaleNoteIndices.length)];
          melody.push({ noteIndex: baseNote, time });

          // 25% chance to add harmony
          if (Math.random() < 0.25) {
            const harmony = scaleNoteIndices[Math.floor(Math.random() * scaleNoteIndices.length)];
            melody.push({ noteIndex: harmony, time });
          }
          break;
        }

        default:
          break;
      }
    }
  }

  return melody;
};




  const loadRandomMelody = () => {
    const melody = generateRandomMelody();
    setNotesPlayed(melody);
    setColorMap(melody.map(({ noteIndex, time }) => ({
      noteIndex,
      time,
      color: getRandomColor(),
    })));
  };


  const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNFTs(nfts);
      setLoading(false);
      console.log("NFTs fetched:", nfts);
    };

  useEffect(() => {
    fetchNFTs();
  }, []);

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
      fetchNFTs(); // Refresh the NFTs after saving
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
    stopDrums();
  };

  const stopPlayback = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    setIsPlayingBack(false);
    setPlayIndex(null);
    stopDrums();
  };

  const playback = () => {
    setIsPlayingBack(true);
    startDrums();

    let current = 0;
    const sorted = [...notesPlayed].sort((a, b) => a.time - b.time);
    const interval = (60 / tempo) * 1000;

    const loop = setInterval(() => {
      if (current >= 24) {
        clearInterval(loop);
        playbackIntervalRef.current = null;
        setPlayIndex(null);
        setIsPlayingBack(false);
        stopDrums();
        return;
      }

      setPlayIndex(current);
      const hits = sorted.filter((n) => n.time === current);
      hits.forEach(({ noteIndex }) => {
        const osc = ctx?.createOscillator();
        if (osc) {
          osc.frequency.value = notes[noteIndex][1];
          osc.type = "sawtooth";
          if (ctx) {
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          }
        }
      });
      current++;
    }, interval);

    playbackIntervalRef.current = loop;
  };


  return (
    <>
      <NFTSliderPanel 
        nfts={nfts}
        loading={loading}
      />

      <div className={styles.musicBox}>
        <h3 style={{ color: frequencyStyle.color }}>BlockBeats <span data-text="NFT" className="glitch">NFT</span></h3>
        <div onClick={() => setIsIAGeneratorOpen(true)} style={{ display: "inline-block", cursor: "pointer", position: "relative", zIndex: 2 }}>
          <span style={{ position: 'absolute', left: '-50px', fontSize: '12px', top: 0, textAlign: 'left' }}>
            <Image
              src={`/arrow-pink.gif`}
              alt="AI Icon"
              width={50}
              height={50}
              style={{ filter: 'drop-shadow(0 0 5px #ff00ff)', transform: 'rotate(90deg)' }}
            />
          </span>
          <span style={{ position: 'absolute', left: 50, fontSize: '12px', top: 8, textAlign: 'left' }}>IA Generator</span>
          <Image
            src={`/logo.webp`}
            alt="BlockBeats Logo"
            width={50}
            height={50}
          />  
        </div>
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

          <Modal
            open={isIAGeneratorOpen}
            onClose={() => setIsIAGeneratorOpen(false)}
            styles={{
              modal: {
                width: '90%',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center',
                height: 'auto',
                marginTop: '50px',
                backgroundColor: '#222',
                color: frequencyStyle.color,
                borderRadius: '8px',
                padding: '20px',
              },
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              },
            }}
            classNames={{ modal: styles.modal }}
          >
            <div style={{ margin: '20px 0', color: frequencyStyle.color }}>

              <PixelPreview
                colorMap={notesPlayed.map(({ noteIndex, time }) => ({
                  noteIndex,
                  time,
                  color: getRandomColor(),
                }))}
                notesCount={notes.length}
                size={240}
                style={{ marginTop: "10px", borderRadius: "12px" }}
              />
              <br />

              <label htmlFor="scaleSelect">🎼 Scale: </label>
              <select
                id="scaleSelect"
                value={selectedScale}
                onChange={(e) => setSelectedScale(e.target.value as ScaleName)}
              >
                {SCALE_NAMES.map((scaleKey) => (
                  <option key={scaleKey} value={scaleKey}>
                    {scaleDescriptions[scaleKey]}
                  </option>
                ))}
              </select>

                <br /><br />

                <label htmlFor="firstNoteSelect">🎶 Base/Root Note: </label>
                <select
                  id="firstNoteSelect"
                  value={firstNote}
                  onChange={(e) => setFirstNote(e.target.value)}
                >
                  {notes.map(([note]) => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>

                <br /><br />

                <label htmlFor="melodyKind">🎼 Mode: </label>
                <select
                  id="melodyKind"
                  value={melodyKind}
                  onChange={(e) => setMelodyKind(e.target.value as 'chords' | 'solo' | 'both')}
                >
                  <option value="chords">Chords</option>
                  <option value="solo">Single Notes</option>
                  <option value="both">Both</option>
                </select>
                  <br />
                  <br />

              <button onClick={loadRandomMelody} disabled={isPlayingBack} className={styles.submitBtn} style={{ marginBottom: '-10px' }}>🎧 Generate Random Song</button>
            </div>
          </Modal>

          <ControlsPanel
            isPlayingBack={isPlayingBack}
            tempo={tempo}
            setTempo={setTempo}
            onPlay={playback}
            onStop={stopPlayback}
            onReset={resetBoard}
            onSave={saveNFTData}
            onOpenModal={() => setIsModalOpen(true)}
            frequencyStyle={frequencyStyle}
            onIAGeneration={loadRandomMelody}
          />
          
          <div className={`${isPlayingBack && 'disabled'}`} style={{ position: "relative", backdropFilter: 'blur(50px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>

            <PixelCanvas
              colorMap={colorMap}
              playingIndex={playIndex}
              color={frequencyStyle.color}
              onCanvasClick={handleCanvasClick}
            />
          
            <Piano onNotePlay={handleNotePlay} ctx={ctx} />
            <div className={styles.melodyDataInfo} style={{ color: frequencyStyle.color, zIndex: 2, position: "relative", textAlign: "center" }}>
              <div>
                {/* {notesPlayed.length} notes played
                <br /> */}
                {/* <p>🌟 Root Note: <strong>{firstNote}</strong></p> */}
                <label>🎵 Tempo: {tempo} BPM 🥁</label>
                <input type="range" min={60} max={420} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicDrawingPage;
