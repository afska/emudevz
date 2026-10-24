const WORKLET_NAME = "player-worklet";
const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const audioWorklet = new URL("./audioWorklet.js", import.meta.url);

export default class Speaker {
	constructor(onAudioRequested = () => {}) {
		this.onAudioRequested = onAudioRequested;
	}

	async start() {
		if (this._audioCtx) return;
		if (!window.AudioContext) return;

		this._audioCtx = new window.AudioContext({
			sampleRate: SAMPLE_RATE,
		});

		const audioCtx = this._audioCtx;
		await audioCtx.audioWorklet.addModule(audioWorklet);
		if (this._audioCtx !== audioCtx) return;

		this.playerWorklet = new AudioWorkletNode(audioCtx, WORKLET_NAME, {
			outputChannelCount: [CHANNELS],
		});
		this.playerWorklet.connect(audioCtx.destination);
		this.playerWorklet.port.onmessage = (e) => {
			this.onAudioRequested(e.data);
		};
	}

	get state() {
		return this._audioCtx?.state ?? "off";
	}

	resume() {
		return this._audioCtx?.resume();
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
