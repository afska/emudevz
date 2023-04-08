import audioWorklet from "worklet-loader!./audioWorklet.js";

const WORKLET_NAME = "player-worklet";
const WEBAUDIO_BUFFER_SIZE = 1024;
const SAMPLE_RATE = 44100;
const CHANNELS = 1;

export default class Speaker {
	constructor(initialVolume = 1) {
		this.initialVolume = initialVolume;
	}

	async start() {
		if (this._audioCtx) return;
		if (!window.AudioContext) return;

		this.bufferSize = 0;

		this._audioCtx = new window.AudioContext({
			sampleRate: SAMPLE_RATE,
		});

		this.gainNode = this._audioCtx.createGain();
		this.gainNode.gain.value = this.initialVolume;
		this.gainNode.connect(this._audioCtx.destination);

		await this._audioCtx.audioWorklet.addModule(audioWorklet);
		if (this._audioCtx == null) {
			this.stop();
			return;
		}

		this.playerWorklet = new AudioWorkletNode(this._audioCtx, WORKLET_NAME, {
			outputChannelCount: [CHANNELS],
			processorOptions: {
				bufferSize: WEBAUDIO_BUFFER_SIZE,
			},
		});
		this.playerWorklet.connect(this.gainNode);
		this.playerWorklet.port.onmessage = (event) => {
			this.bufferSize = event.data;
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
