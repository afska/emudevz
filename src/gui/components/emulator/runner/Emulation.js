import FrameTimer from "./FrameTimer";
import Speaker from "./Speaker";

const SYNC_TO_AUDIO = false; // FIXME: ROLLBACK
const APU_SAMPLE_RATE = 44100;
const AUDIO_BUFFER_LIMIT = 4096;
const FPS = 60.098;

/**
 * An emulator runner instance.
 */
export default class Emulation {
	constructor(
		NEEES,
		bytes,
		screen,
		getInput = () => [{}, {}],
		onFps = () => {},
		onError = () => {},
		onSaveState = () => {},
		saveState = null,
		volume = 1,
		onFrame = () => {}
	) {
		this._onFrameCallback = onFrame;

		this.screen = screen;
		this.samples = [];

		this.speaker = new Speaker(volume);
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
		this.frameTimer = new FrameTimer(() => {
			this._updateInput(getInput());

			if (
				this.isDebugging &&
				!this.isDebugStepFrameRequested &&
				!this.isDebugScanlineRequested
			)
				return;

			const isDebugScanlineRequested = this.isDebugScanlineRequested;
			this.isDebugStepFrameRequested = false;
			this.isDebugScanlineRequested = false;

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
				if (isDebugScanlineRequested) {
					this.neees.scanline();
				} else if (SYNC_TO_AUDIO) {
					const requestedSamples = APU_SAMPLE_RATE / FPS;
					const newBufferSize = this.speaker.bufferSize + requestedSamples;
					if (newBufferSize <= AUDIO_BUFFER_LIMIT)
						this.neees.samples(requestedSamples);
				} else {
					this.neees.frame();
				}

				this._updateSound();
			} catch (error) {
				onError(error);
			}
		}, onFps);

		try {
			this.neees.load(bytes);
			if (this.saveState != null) this.neees.setSaveState(this.saveState);
			this.frameTimer.start();
		} catch (error) {
			onError(error);
		}
	}

	terminate = () => {
		this.frameTimer.stop();
		this.speaker.stop();
	};

	_onFrame = (frameBuffer) => {
		this.frameTimer.countNewFrame();
		this.screen.setBuffer(frameBuffer);
		this._onFrameCallback(frameBuffer, this.neees);
	};

	_onAudio = (sample) => {
		this.samples.push(sample);
	};

	_updateSound() {
		this.speaker.writeSamples(this.samples);
		this.samples = [];
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
				if (input[i].$debugStepScanline) this.isDebugScanlineRequested = true;
			}

			for (let button in input[i])
				if (button[0] !== "$")
					this.neees.setButton(i + 1, button, input[i][button]);
		}
	}
}
