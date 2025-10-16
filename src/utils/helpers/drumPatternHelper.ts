import { DRUM_SOUNDS } from '../constants/drumMachine';

interface DrumPatternData {
  grid: boolean[][];
  selectedSounds: string[];
}

interface DrumPatternPlaybackOptions {
  tempo: number;
  steps: number;
  volume: number;
  onStop?: () => void;
}

/**
 * Play a drum pattern using the actual drum sounds and grid data
 * This replicates the same playback logic used in the DrumSequencer component
 */
export const playDrumPattern = (
  drumData: DrumPatternData,
  options: DrumPatternPlaybackOptions
): (() => void) => {
  const { grid, selectedSounds } = drumData;
  const { tempo, steps, volume, onStop } = options;

  // Initialize audio elements for drum sounds
  const audioRefs: { [key: string]: HTMLAudioElement } = {};
  
  // Preload all drum sounds
  DRUM_SOUNDS.forEach((sound) => {
    if (!audioRefs[sound.name]) {
      const audio = new Audio(sound.url);
      audio.preload = 'auto';
      audio.volume = volume / 100;
      
      // Add error handling
      audio.addEventListener('error', (e) => {
        console.error(`Failed to load drum sound: ${sound.name}`, e);
      });
      
      audioRefs[sound.name] = audio;
    } else {
      // Update volume for existing audio elements
      audioRefs[sound.name].volume = volume / 100;
    }
  });

  let currentStep = 0;
  let isPlaying = true;

  // Calculate step duration in milliseconds
  const stepDuration = (60 / tempo) * 1000;

  // Play sounds for current step
  const playStep = () => {
    if (!isPlaying) return;

    grid.forEach((row, rowIndex) => {
      if (row[currentStep]) {
        const selectedSound = selectedSounds[rowIndex];
        const audio = audioRefs[selectedSound];
        
        if (audio) {
          // Reset audio to beginning and play
          audio.currentTime = 0;
          audio.volume = volume / 100;
          
          // Play the sound
          audio.play().catch((error) => {
            console.warn(`Failed to play drum sound ${selectedSound}:`, error);
          });
        }
      }
    });
  };

  // Start the sequencer
  const intervalId = setInterval(() => {
    if (!isPlaying) {
      clearInterval(intervalId);
      return;
    }

    playStep();
    currentStep = (currentStep + 1) % steps;

    // Stop after completing one full cycle (for demo purposes)
    // In a real scenario, you might want to loop indefinitely
    if (currentStep === 0) {
      // After one complete cycle, stop
      setTimeout(() => {
        isPlaying = false;
        clearInterval(intervalId);
        onStop?.();
      }, stepDuration);
    }
  }, stepDuration);

  // Play the first step immediately
  playStep();

  // Return stop function
  return () => {
    isPlaying = false;
    clearInterval(intervalId);
    
    // Stop all currently playing audio
    Object.values(audioRefs).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };
};

/**
 * Create a simple drum pattern visualization for preview
 */
export const createDrumPatternPreview = (grid: boolean[][], selectedSounds: string[]) => {
  return grid.map((row, rowIndex) => ({
    sound: selectedSounds[rowIndex] || 'unknown',
    pattern: row.map(beat => beat ? '●' : '○').join('')
  }));
};
