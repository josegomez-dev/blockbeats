export const playSound = (audio: HTMLAudioElement) => {
  audio.currentTime = 0;
  audio.play();
};
