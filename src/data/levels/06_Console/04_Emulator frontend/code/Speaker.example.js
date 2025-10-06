import audioWorklet from "./audioWorklet?worker&url";

const WORKLET_NAME = "player-worklet";
const APU_SAMPLE_RATE = 44100;
const CHANNELS = 1;

export default class Speaker {
  constructor(onAudioRequested) {
    this.onAudioRequested = onAudioRequested;
  }

  async start() {
    if (this._audioCtx) return;
    if (!window.AudioContext) return;

    this._audioCtx = new window.AudioContext({
      sampleRate: APU_SAMPLE_RATE,
    });

    await this._audioCtx.audioWorklet.addModule(audioWorklet);
    if (this._audioCtx == null) {
      this.stop();
      return;
    }

    this.playerWorklet = new AudioWorkletNode(this._audioCtx, WORKLET_NAME, {
      outputChannelCount: [CHANNELS],
    });
    this.playerWorklet.connect(this._audioCtx.destination);
    this.playerWorklet.port.onmessage = (event) => {
      this.onAudioRequested(event.data);
    };
  }

  writeSamples = (samples) => {
    if (!this.playerWorklet) return;

    this.playerWorklet.port.postMessage(samples);
  };

  stop() {
    if (this.playerWorklet) {
      this.playerWorklet.port.close();
      this.playerWorklet.disconnect();
      this.playerWorklet = null;
    }

    if (this._audioCtx) {
      this._audioCtx.close().catch(console.error);
      this._audioCtx = null;
    }
  }
}
