'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DRUM_SOUNDS } from '../../../utils/constants/drumMachine';
import { playSound } from '../../../utils/helpers/audioHelper';

interface DrumSequencerProps {
  grid: boolean[][];
  selectedSounds: string[];
  isPlaying: boolean;
  tempo: number;
  steps: number;
  volume: number;
  onStepChange: (step: number) => void;
}

const DrumSequencer: React.FC<DrumSequencerProps> = ({
  grid,
  selectedSounds,
  isPlaying,
  tempo,
  steps,
  volume,
  onStepChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Initialize audio elements
  useEffect(() => {
    DRUM_SOUNDS.forEach((sound) => {
      if (!audioRefs.current[sound.name]) {
        const audio = new Audio(sound.url);
        audio.preload = 'auto';
        audio.volume = volume / 100;
        
        // Add error handling
        audio.addEventListener('error', (e) => {
          console.error(`Failed to load audio: ${sound.name}`, e);
        });
        
        audioRefs.current[sound.name] = audio;
      } else {
        // Update volume for existing audio elements
        audioRefs.current[sound.name].volume = volume / 100;
      }
    });
  }, [volume]);

  // Handle play/stop state changes and timing
  useEffect(() => {
    if (isPlaying) {
      // Clear any existing interval
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Calculate step duration in milliseconds
      const stepDuration = (60 / tempo) * 1000;
      
      // Start the sequencer
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % steps;
          onStepChange(nextStep);
          return nextStep;
        });
      }, stepDuration);
    } else {
      // Stop the sequencer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentStep(0);
      onStepChange(0);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, tempo, steps, onStepChange]);

  // Play sounds when step changes
  useEffect(() => {
    if (isPlaying && currentStep >= 0) {
      grid.forEach((row, rowIndex) => {
        if (row[currentStep]) {
          const selected = selectedSounds[rowIndex];
          const audio = audioRefs.current[selected];
          if (audio) {
            // Reset audio to beginning and play
            audio.currentTime = 0;
            audio.volume = volume / 100;
            playSound(audio);
          }
        }
      });
    }
  }, [currentStep, isPlaying, grid, selectedSounds, volume]);

  // Reset current step when steps change
  useEffect(() => {
    if (currentStep >= steps) {
      setCurrentStep(0);
      onStepChange(0);
    }
  }, [steps, currentStep, onStepChange]);

  return null; // This component only handles logic, no UI
};

export default DrumSequencer;
