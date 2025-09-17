import audioWorklet from "./audioWorklet?worker&url";

const WORKLET_NAME = "player-worklet";
const WEBAUDIO_BUFFER_SIZE = 1024;
const SAMPLE_RATE = 44100;
const CHANNELS = 1;

let sharedAudioContext = null;
let sharedWorkletModulePromise = null;

export default class Speaker {
	constructor(onAudioRequested = () => {}, initialVolume = 1, options = {}) {
		this.onAudioRequested = onAudioRequested;
		this.initialVolume = initialVolume;
		this.options = options;
	}

	async start() {
		if (this._audioCtx) return;
		if (!window.AudioContext) return;

		if (!sharedAudioContext)
			sharedAudioContext = new window.AudioContext({ sampleRate: SAMPLE_RATE });
		this._audioCtx = sharedAudioContext;

		this.gainNode = this._audioCtx.createGain();
		this.gainNode.gain.value = this.initialVolume;
		this.gainNode.connect(this._audioCtx.destination);

		if (!sharedWorkletModulePromise)
			sharedWorkletModulePromise = this._audioCtx.audioWorklet.addModule(
				audioWorklet
			);
		await sharedWorkletModulePromise;
		if (this._audioCtx == null) {
			await this.stop();
			return;
		}

		this.playerWorklet = new AudioWorkletNode(this._audioCtx, WORKLET_NAME, {
			outputChannelCount: [CHANNELS],
			processorOptions: {
				bufferSize: WEBAUDIO_BUFFER_SIZE,
				ringBufferSize: this.options.ringBufferSize,
			},
		});
		this.playerWorklet.connect(this.gainNode);
		this.playerWorklet.port.onmessage = (event) => {
			this.onAudioRequested(event.data);
		};
	}

	writeSamples = (samples) => {
		if (!this.playerWorklet) return;

		this.playerWorklet.port.postMessage(samples);
	};

	setVolume = (volume) => {
		if (!this.gainNode) return;

		this.gainNode.gain.value = volume;
	};

	async stop() {
		if (this.playerWorklet) {
			this.playerWorklet.port.onmessage = null;
			this.playerWorklet.port.close();
			this.playerWorklet.disconnect();
			this.playerWorklet = null;
		}

		if (this.gainNode) {
			this.gainNode.disconnect();
			this.gainNode = null;
		}

		const ctx = this._audioCtx;
		this._audioCtx = null;
		if (ctx && ctx !== sharedAudioContext) {
			try {
				await ctx.close();
			} catch {}
		}
	}
}
