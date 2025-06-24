/** Global settings for the Music-Drawing Machine */
export const AUDIO = {
  OSC_TYPE: 'sawtooth',
  NOTE_LENGTH: 0.3,          // seconds
  DRUM_LENGTH: 0.2,          // seconds
  DRUM_VOLUME: 0.5,
};

export const SEQUENCER = {
  STEPS: 24,                 // columns in the pixel grid
  DEFAULT_TEMPO: 350,        // BPM
  DRUM_PATTERN_REPEAT: 24,   // bars before the loop stops
};

export const UI = {
  MODAL_WIDTH: '90%',
  MODAL_MAX_WIDTH: '600px',
  ARROW_HINT_SIZE: 50,
};
