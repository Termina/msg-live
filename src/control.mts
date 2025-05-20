/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
  setDefaultBaseUrls,
} from "@google/genai";

import { getAudioBlob, play } from "./audio.mjs";
import { loadAudio } from "./player.mjs";

let storageKey = "geminiApiKey";

let getGeminiApiKey = (): string => {
  const key = localStorage.getItem(storageKey);
  if (key) {
    return key;
  } else {
    let key = prompt("Please enter your Gemini API key");
    if (key) {
      localStorage.setItem(storageKey, key);
      return key;
    } else {
      alert("Please enter your Gemini API key");
      return getGeminiApiKey();
    }
  }
};

const GEMINI_API_KEY = getGeminiApiKey();
const GOOGLE_GENAI_USE_VERTEXAI = false;

setDefaultBaseUrls({
  geminiUrl: "https://ja.chenyong.life",
});

let cacheOfSession: Session = null;

async function live(client: GoogleGenAI, model: string) {
  // const responseQueue: LiveServerMessage[] = [];

  // // This should use an async queue.
  // async function waitMessage(): Promise<LiveServerMessage> {
  //   let done = false;
  //   let message: LiveServerMessage | undefined = undefined;
  //   while (!done) {
  //     message = responseQueue.shift();
  //     if (message) {
  //       // message.data.
  //       // console.log(message.serverContent);
  //       if (message.data) {
  //         // play(message.data);
  //         loadAudio(message.data);
  //       } else {
  //         console.log("no data", message);
  //       }
  //       // console.log(new Audio(message.data));
  //       done = true;
  //     } else {
  //       await new Promise((resolve) => setTimeout(resolve, 100));
  //     }
  //   }
  //   return message!;
  // }

  // async function handleTurn(): Promise<LiveServerMessage[]> {
  //   const turn: LiveServerMessage[] = [];
  //   let done = false;
  //   while (!done) {
  //     const message = await waitMessage();
  //     turn.push(message);
  //     if (message.serverContent && message.serverContent.turnComplete) {
  //       done = true;
  //     }
  //   }
  //   return turn;
  // }

  const session = await client.live.connect({
    model: model,

    callbacks: {
      onopen: function () {
        console.debug("Opened");
      },
      onmessage: function (message: LiveServerMessage) {
        // responseQueue.push(message);
        if (message.data) {
          loadAudio(message.data);
        } else {
          console.warn("no data", message);
        }
      },
      onerror: function (e: ErrorEvent) {
        console.debug("Error:", e.message);
      },
      onclose: function (e: CloseEvent) {
        console.debug("Close:", e.reason);
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      httpOptions: {
        baseUrl: "https://ja.chenyong.life",
      },
      tools: [
        {
          urlContext: {},
        },
        {
          googleSearch: {},
        },
      ],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_LOW,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            // voiceName: "Leda",
            voiceName: "Aoede",
          },
        },
        // https://cloud.google.com/text-to-speech/docs/voices?hl=zh-cn
        // languageCode: "en-US",
        languageCode: "cmn-CN",
        // languageCode: "cmn-TW",
      },
    },
  });

  cacheOfSession = session;

  // const simple = "give me introduction of large language models";
  // console.log("-".repeat(80));
  // console.log(`Sent: ${simple}`);
  // session.sendClientContent({ turns: simple });

  // await handleTurn();
  // console.log("-".repeat(80));

  (window as any).ask = async (s: string) => {
    if (cacheOfSession) {
      cacheOfSession.sendClientContent({ turns: s });
      // await handleTurn();
      console.log("-".repeat(80));
    } else {
      console.log("session not ready");
    }
  };

  // session.close();
}

async function main() {
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    console.log("urlContext isn't supported on Vertex AI");
  } else {
    const client = new GoogleGenAI({
      vertexai: false,
      apiKey: GEMINI_API_KEY,
    });
    const model = "gemini-2.0-flash-live-001";
    await live(client, model).catch((e) => console.error("got error", e));
  }
}

main();
