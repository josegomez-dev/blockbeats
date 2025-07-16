'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '@/app/assets/styles/DrumDesigner.module.css';
import { BACKING_TRACKS, DRUM_SOUNDS } from '../../../utils/constants/drumMachine';
import { playSound } from '../../../utils/helpers/audioHelper';
import PlaybackControls from '@/components/machines/PlaybackControls';
import Footer from '@/components/Footer';

const MIN_STEPS = 4;
const MAX_STEPS = 32;
const MAX_INSTRUMENTS = 5;
const INITIAL_INSTRUMENTS = 4;

const MAX_FREE_ROWS = 7; // 4 default + 3 more allowed
const PREMIUM_LOCK_THRESHOLD = MAX_FREE_ROWS;


const DrumDesigner = () => {
  const [steps, setSteps] = useState(24);
  const [grid, setGrid] = useState<boolean[][]>(
    Array(INITIAL_INSTRUMENTS).fill(null).map(() => Array(24).fill(false))
  );
  const [selectedSounds, setSelectedSounds] = useState<string[]>([
    DRUM_SOUNDS.find((s) => s.type === 'kick')?.name || '',
    DRUM_SOUNDS.find((s) => s.type === 'snare')?.name || '',
    DRUM_SOUNDS.find((s) => s.type === 'sfx')?.name || '',
    DRUM_SOUNDS.find((s) => s.type === 'hihat')?.name || '',
  ]);

  const [expandedDropdown, setExpandedDropdown] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(100);
  const [backingTrack, setBackingTrack] = useState('');
  const [soundFilter, setSoundFilter] = useState<string>('all');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    DRUM_SOUNDS.forEach((sound) => {
      const audio = new Audio(sound.url);
      audioRefs.current[sound.name] = audio;
    });
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps);
      }, (60 / tempo) * 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentStep(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, tempo, steps]);

  useEffect(() => {
    if (isPlaying) {
      grid.forEach((row, rowIndex) => {
        if (row[currentStep]) {
          const selected = selectedSounds[rowIndex];
          playSound(audioRefs.current[selected]);
        }
      });
    }
  }, [currentStep, isPlaying]);

  const toggleCell = (row: number, step: number) => {
    const updated = grid.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === step ? !c : c)) : r
    );
    setGrid(updated);
  };

  const addInstrumentRow = () => {
    if (grid.length >= MAX_INSTRUMENTS) return;
    setGrid((prev) => [...prev, Array(steps).fill(false)]);
    setSelectedSounds((prev) => [...prev, DRUM_SOUNDS[0].name]);
  };

  const getTypeOfSelected = (rowIndex: number) => {
    const selectedName = selectedSounds[rowIndex];
    return DRUM_SOUNDS.find((s) => s.name === selectedName)?.type;
  };

  const changeSteps = (newSteps: number) => {
    setSteps(newSteps);
    setGrid((prev) =>
      prev.map((row) => {
        if (newSteps > row.length) {
          return row.concat(Array(newSteps - row.length).fill(false));
        } else {
          return row.slice(0, newSteps);
        }
      })
    );
  };

  return (
    <>
      <div className={styles.drumDesigner}>
        <h2 className='glitch box'> 🥁 Drum Designer Machine</h2>
        <br />
        <PlaybackControls
          isPlaying={isPlaying}
          tempo={tempo}
          steps={steps}
          minSteps={MIN_STEPS}
          maxSteps={MAX_STEPS}
          onPlay={() => setIsPlaying(true)}
          onStop={() => setIsPlaying(false)}
          onTempoChange={setTempo}
          onStepChange={changeSteps}
        />

        <div className={styles.grid}>
          {grid.map((row, rowIndex) => {
            const options = DRUM_SOUNDS; // Show all sounds to freely switch type
            const currentSound = DRUM_SOUNDS.find((s) => s.name === selectedSounds[rowIndex]);

            return (
              <div key={rowIndex} className={styles.row}>
                <div
                  className={styles.instrumentDropdown}
                  onClick={() => setExpandedDropdown(expandedDropdown === rowIndex ? null : rowIndex)}
                >
                  <span className={styles.iconOnly}>
                    {currentSound?.icon}
                  </span>
                  {expandedDropdown === rowIndex && (
                    <div className={styles.dropdownMenu}>
                      {options.map((sound) => (
                        <div
                          key={sound.name}
                          className={styles.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = [...selectedSounds];
                            updated[rowIndex] = sound.name;
                            setSelectedSounds(updated);
                            setExpandedDropdown(null);
                          }}
                        >
                          <span>{sound.icon}</span> <span>{sound.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {row.map((cell, stepIndex) => (
                  <div
                    key={stepIndex}
                    className={`${styles.cell} ${cell ? styles.active : ''} ${
                      stepIndex === currentStep ? styles.playing : ''
                    }`}
                    onClick={() => toggleCell(rowIndex, stepIndex)}
                  />
                ))}
              </div>
            );
          })}

          {/* PREMIUM ROW SLOT */}
          {grid.length < MAX_FREE_ROWS && (
            <div className={`${styles.row} ${styles.lockedRow}`}>
              <div className={styles.lockedSelector}>
                🔓 <span>Extra Slot</span>
              </div>
              {Array(steps)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className={styles.cellDisabled} />
                ))}
              <button className={styles.unlockButton} onClick={addInstrumentRow}>
                ➕ Unlock Row
              </button>
            </div>
          )}

          {grid.length >= MAX_FREE_ROWS && (
            <div className={`${styles.row} ${styles.lockedRow}`}>
              <div className={styles.lockedSelector}>
                🔒 <span>Premium Only</span>
              </div>
              {Array(steps)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className={styles.cellDisabled} />
                ))}
              <button
                className={styles.unlockButton}
                onClick={() =>
                  alert('🚀 Premium required! Unlock advanced features and unlimited instruments.')
                }
              >
                🪙 Go Premium
              </button>
            </div>
          )}

        </div>

        <div className={styles.soundGallery}>
          <h3 className='box glitch'>🎧 Sound Gallery</h3>
          <br />
          <div className={styles.filters}>
            {['all', 'kick', 'snare', 'hihat', 'sfx'].map((type) => (
              <button
                key={type}
                className={`${styles.filterBtn} ${soundFilter === type ? styles.activeFilter : ''}`}
                onClick={() => setSoundFilter(type)}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={styles.soundGrid}>
            {DRUM_SOUNDS.filter(
              (s) => !soundFilter || soundFilter === 'all' || (s.type && s.type === soundFilter)
            ).map((sound) => (
              <div
                key={sound.name}
                className={styles.soundItem}
                onClick={() => playSound(audioRefs.current[sound.name])}
              >
                <span className={styles.icon}>{sound.icon}</span>
                <span className={styles.label}>{sound.label}</span>
              </div>
            ))}
          </div>
        </div>

        {backingTrack && <audio src={backingTrack} controls autoPlay loop />}
      </div>
      <Footer />
    </>
  );
};

export default DrumDesigner;
