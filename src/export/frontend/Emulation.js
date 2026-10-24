import user from "../emulator/code/index.js";
import Speaker from "./audio/Speaker.js";
import config from "./config.js";
import FrameTimer from "./video/FrameTimer.js";

const SAMPLE_RATE = 44100;
const FRAME_RATE = 60.098;
const SAMPLES_PER_FRAME = Math.floor(SAMPLE_RATE / FRAME_RATE) + 1;

const PRESS_KEY_TO_ENABLE_AUDIO = "Press any key to enable audio!";

export default class Emulation {
	constructor(
		bytes,
		screen,
		getInput = () => [{}, {}],
		onFps = () => {},
		onError = () => {},
		onSaveState = () => {},
		saveState = null
	) {
		this.screen = screen;
		this.samples = [];
		this.onError = onError;

		this.speaker = new Speaker(({ need, have }) => {
			try {
				if (this._canSyncToAudio()) {
					const target = config.AUDIO_BUFFER_SIZE / 2;

					let n = need;
					if (have > target + config.AUDIO_DRIFT_THRESHOLD) n--;
					else if (have < target - config.AUDIO_DRIFT_THRESHOLD) n++;

					this.nes.samples(n);
					this._updateSound();
				}
			} catch (err) {
				onError(err);
			}
		});

		this.saveState = saveState;
		this.isSaveStateRequested = false;
		this.isLoadStateRequested = false;
		this.wasSaveStateRequested = false;
		this.wasLoadStateRequested = false;

		this.nes = new user.Emulator(this._onFrame, this._onAudio);
		this.frameTimer = new FrameTimer(() => {
			this._updateInput(getInput());

			if (this.isSaveStateRequested && !this.wasSaveStateRequested) {
				this.saveState = this.nes.getSaveState();
				this.wasSaveStateRequested = true;

				onSaveState(this.saveState);
			}
			if (
				this.isLoadStateRequested &&
				!this.wasLoadStateRequested &&
				this.saveState != null
			) {
				this.nes.setSaveState(this.saveState);
				this.wasLoadStateRequested = true;
			}

			try {
				if (!this._canSyncToAudio()) {
					this.nes.frame();
					if (this.samples.length !== SAMPLES_PER_FRAME)
						this.samples = this._resample(this.samples, SAMPLES_PER_FRAME);
					this._updateSound();
				}
			} catch (err) {
				onError(err);
			}
		}, onFps);

		this.nes.load(bytes);
	}

	start() {
		this.frameTimer.start();
		this.speaker.start().catch((err) => {
			if (this.frameTimer._isRunning) this.onError(err);
		});

		if (this.speaker.state === "suspended") alert(PRESS_KEY_TO_ENABLE_AUDIO);
	}

	terminate = () => {
		this.frameTimer.stop();
		this.speaker.stop();
	};

	_onFrame = (frameBuffer) => {
		this.frameTimer.countNewFrame();
		this.screen.setBuffer(frameBuffer);
	};

	_onAudio = (sample) => {
		this.samples.push(sample);
	};

	_updateSound() {
		this.speaker.writeSamples(this.samples);
		this.samples = [];
	}

	_resample(src, target) {
		const n = src.length;
		if (n === target) return src.slice();
		if (n === 0) return new Array(target).fill(0);
		if (n === 1) return new Array(target).fill(src[0]);

		const out = new Array(target);
		for (let i = 0; i < target; i++) {
			const t = (i * (n - 1)) / (target - 1);
			const k = Math.floor(t);
			const a = src[k];
			const b = src[k + 1] ?? a;
			out[i] = a + (b - a) * (t - k);
		}

		return out;
	}

	_updateInput(input) {
		for (let i = 0; i < 2; i++) {
			if (i === 0) {
				this.isSaveStateRequested = input[i].$saveState;
				this.isLoadStateRequested = input[i].$loadState;
				if (!input[i].$saveState) this.wasSaveStateRequested = false;
				if (!input[i].$loadState) this.wasLoadStateRequested = false;
			}

			for (let button in input[i])
				if (button[0] !== "$")
					this.nes.setButton(i + 1, button, input[i][button]);
		}
	}

	_canSyncToAudio() {
		return (
			config.SYNC_TO_AUDIO &&
			this.speaker.state === "running" &&
			!!this.speaker.playerWorklet
		);
	}
}
