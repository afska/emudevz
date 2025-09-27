import FrameTimer from "./FrameTimer";
import Speaker from "./Speaker";

const APU_SAMPLE_RATE = 44100;
const MAX_SAMPLE_MEMORY_SECONDS = 10;
const AUDIO_DRIFT_THRESHOLD = 64;

/**
 * An emulator runner instance.
 */
export default class Emulation {
	constructor(
		NEEES,
		bytes,
		saveFileBytes,
		screen,
		getInput = () => [{}, {}],
		onFps = () => {},
		onError = () => {},
		onSaveState = () => {},
		onFrame = () => {},
		saveState = null,
		volume = 1,
		syncToVideo = false,
		audioBufferSize = null
	) {
		this._onFrameCallback = onFrame;
		this._syncToVideo = syncToVideo;

		this.screen = screen;
		this.samples = [];
		this.resetChannelSamples();
		this.enabledChannels = {
			pulse1: true,
			pulse2: true,
			triangle: true,
			noise: true,
			dmc: true,
		};

		this.speaker = new Speaker(
			({ need, have, target }) => {
				try {
					if (this._canSyncToAudio()) {
						let n = need;
						if (have > target + AUDIO_DRIFT_THRESHOLD) n--;
						else if (have < target - AUDIO_DRIFT_THRESHOLD) n++;
						this.neees.samples(n);
					}

					this._updateSound(need);
				} catch (error) {
					onError(error);
				}
			},
			volume,
			{ ringBufferSize: audioBufferSize }
		);
		this.speaker.start();

		this.saveState = saveState;
		this.isSaveStateRequested = false;
		this.isLoadStateRequested = false;
		this.wasSaveStateRequested = false;
		this.wasLoadStateRequested = false;
		this.isDebugging = false;
		this.isDebugStepFrameRequested = false;
		this.isDebugStepScanlineRequested = false;

		this.neees = new NEEES(this._onFrame, this._onAudio);
		this.bytes = bytes;
		window.EmuDevz.emulation = this;

		this.frameTimer = new FrameTimer(() => {
			this._updateInput(getInput());

			if (
				this.isDebugging &&
				!this.isDebugStepFrameRequested &&
				!this.isDebugStepScanlineRequested
			)
				return;

			const isDebugStepScanlineRequested = this.isDebugStepScanlineRequested;
			this.isDebugStepFrameRequested = false;
			this.isDebugStepScanlineRequested = false;

			if (this.isSaveStateRequested && !this.wasSaveStateRequested) {
				this.saveState = this.neees.getSaveState();
				this.wasSaveStateRequested = true;

				onSaveState(this.saveState);
			}
			if (
				this.isLoadStateRequested &&
				!this.wasLoadStateRequested &&
				this.saveState != null
			) {
				this.neees.setSaveState(this.saveState);
				this.wasLoadStateRequested = true;
			}

			try {
				if (!this._canSyncToAudio()) {
					if (isDebugStepScanlineRequested) {
						this.neees.scanline(true);
					} else {
						this.neees.frame();
					}
				}
			} catch (error) {
				onError(error);
			}
		}, onFps);

		try {
			this.neees.load(bytes, saveFileBytes);
			if (this.saveState != null) this.neees.setSaveState(this.saveState);
			this.frameTimer.start();
		} catch (error) {
			onError(error);
		}

		this._onError = onError;
	}

	replace = (NEEES, saveFileBytes, saveState) => {
		const hasFrameBuffer = this.neees.ppu?.frameBuffer != null;

		let oldFrameBuffer = null;
		if (hasFrameBuffer) {
			oldFrameBuffer = new Uint32Array(this.neees.ppu.frameBuffer.length);
			for (let i = 0; i < this.neees.ppu.frameBuffer.length; i++)
				oldFrameBuffer[i] = this.neees.ppu.frameBuffer[i];
		}

		this.neees = new NEEES(this._onFrame, this._onAudio);
		this.neees.load(this.bytes, saveFileBytes);
		this.saveState = saveState;
		if (this.saveState != null) this.neees.setSaveState(this.saveState);

		if (hasFrameBuffer) {
			for (let i = 0; i < this.neees.ppu.frameBuffer.length; i++)
				this.neees.ppu.frameBuffer[i] = oldFrameBuffer[i] ?? 0;
		}
	};

	toggleFullscreen = () => {
		this.screen.toggleFullscreen();
	};

	terminate = () => {
		this.frameTimer.stop();
		this.speaker.stop();
		window.EmuDevz.emulation = null;
	};

	resetChannelSamples = () => {
		this.channelSamples = {
			mix: [],
			pulse1: [],
			pulse2: [],
			triangle: [],
			noise: [],
			dmc: [],
		};
	};

	_onFrame = (frameBuffer) => {
		this.frameTimer.countNewFrame();
		this.screen.setBuffer(frameBuffer);
		this._onFrameCallback(frameBuffer, this.neees, this);
	};

	_onAudio = (sample, pulse1, pulse2, triangle, noise, dmc) => {
		if (
			!this.enabledChannels.pulse1 ||
			!this.enabledChannels.pulse2 ||
			!this.enabledChannels.triangle ||
			!this.enabledChannels.noise ||
			!this.enabledChannels.dmc
		) {
			// some channels are muted, so we mix manually
			if (!this.enabledChannels.pulse1) pulse1 = 0;
			if (!this.enabledChannels.pulse2) pulse2 = 0;
			if (!this.enabledChannels.triangle) triangle = 0;
			if (!this.enabledChannels.noise) noise = 0;
			if (!this.enabledChannels.dmc) dmc = 0;

			const pulseOut = 0.00752 * ((pulse1 || 0) + (pulse2 || 0));
			const tndOut =
				0.00851 * (triangle || 0) +
				0.00494 * (noise || 0) +
				0.00335 * (dmc || 0);
			sample = pulseOut + tndOut;
		}

		this.samples.push(sample);

		if (
			this.channelSamples.mix.length <
			APU_SAMPLE_RATE * MAX_SAMPLE_MEMORY_SECONDS
		) {
			this.channelSamples.mix.push(sample);
			this.channelSamples.pulse1.push(pulse1);
			this.channelSamples.pulse2.push(pulse2);
			this.channelSamples.triangle.push(triangle);
			this.channelSamples.noise.push(noise);
			this.channelSamples.dmc.push(dmc);
		}
	};

	_updateSound(maxCount) {
		const take = Math.min(maxCount, this.samples.length);

		const out = this.samples.slice(0, take);
		this.speaker.writeSamples(out);

		this.samples = this.samples.slice(take);
	}

	_updateInput(input) {
		for (let i = 0; i < 2; i++) {
			if (i === 0) {
				this.isSaveStateRequested = input[i].$saveState;
				this.isLoadStateRequested = input[i].$loadState;
				if (!input[i].$saveState) this.wasSaveStateRequested = false;
				if (!input[i].$loadState) this.wasLoadStateRequested = false;
				if (input[i].$startDebugging) this.isDebugging = true;
				if (input[i].$stopDebugging) this.isDebugging = false;
				if (input[i].$debugStepFrame) this.isDebugStepFrameRequested = true;
				if (input[i].$debugStepScanline)
					this.isDebugStepScanlineRequested = true;
			}

			try {
				for (let button in input[i])
					if (button[0] !== "$") {
						this.neees.setButton(i + 1, button, input[i][button]);
					}
			} catch (error) {
				this._onError(error);
			}
		}
	}

	_canSyncToAudio() {
		return !this._syncToVideo && !this.isDebugging;
	}
}
