// thanks to https://www.timsanteford.com/posts/playing-base64-encoded-pcm-audio-in-a-web-browser/

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function createWAVHeader(
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number,
  dataLength: number
) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  function writeString(view: DataView, offset: number, text: string) {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  return buffer;
}

function createWAVBlob(
  pcmData: ArrayBuffer,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number
) {
  const wavHeader = createWAVHeader(
    sampleRate,
    numChannels,
    bitsPerSample,
    pcmData.byteLength
  );

  const wavBuffer = new Uint8Array(wavHeader.byteLength + pcmData.byteLength);
  wavBuffer.set(new Uint8Array(wavHeader), 0);
  wavBuffer.set(new Uint8Array(pcmData), wavHeader.byteLength);

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export const getAudioBlob = (base64PCM: string): Blob => {
  const pcmData = base64ToArrayBuffer(base64PCM);
  const wavBlob = createWAVBlob(pcmData, 24000, 1, 16);
  return wavBlob;
};

export const play = (base64PCM: string) => {
  const pcmData = base64ToArrayBuffer(base64PCM);
  const wavBlob = createWAVBlob(pcmData, 24000, 1, 16);

  const audioURL = URL.createObjectURL(wavBlob);
  const audioElement = document.createElement("audio");
  audioElement.src = audioURL;
  audioElement.controls = true;
  document.body.appendChild(audioElement);
};
