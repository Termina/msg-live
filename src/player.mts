import { getAudioBlob } from "./audio.mjs";

let audioBlobQueue: string[] = [];

let isPlaying = false;

let loopPlay = () => {
  if (audioBlobQueue.length > 0) {
    const audioStr = audioBlobQueue.join("");
    // console.log("play")
    if (audioStr) {
      const audioBlob = getAudioBlob(audioStr);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = 0.5;
      audio.play();
      audio.playbackRate = 1.2;
      audioBlobQueue = [];
      isPlaying = true;
      audio.onended = () => {
        isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        loopPlay();
      };
    }
  } else {
    isPlaying = false;
  }
};

export let loadAudio = (audioStr: string) => {
  audioBlobQueue.push(audioStr);
  if (!isPlaying) {
    if (audioBlobQueue.length > 8) {
      loopPlay();
    }
  }
};
