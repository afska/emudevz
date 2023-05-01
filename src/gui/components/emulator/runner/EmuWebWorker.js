import FrameTimer from "./FrameTimer";

const SYNC_TO_AUDIO = true;
const FPS = 60.098;
const SAMPLE_RATE = 44100;
const AUDIO_BUFFER_LIMIT = 4096;

/**
 * An emulator instance running inside a Web Worker.
 * This contains the communication logic between `Emulator` and `emuWebWorkerRunner`.
 */
export default class EmuWebWorker {
	constructor(Console, postMessage) {
		this.$postMessage = postMessage;

		this.saveState = null;
		this.isSaveStateRequested = false;
		this.isLoadStateRequested = false;
		this.wasSaveStateRequested = false;
		this.wasLoadStateRequested = false;
		this.isDebugging = false;
		this.isDebugStepFrameRequested = false;
		this.isDebugStepScanlineRequested = false;

		this.availableSamples = 0;
		this.samples = [];

		this.nes = new Console(this.onFrame, this.onAudio);

		this.frameTimer = new FrameTimer(
			() => {
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
					this.saveState = this.nes.getSaveState();
					this.wasSaveStateRequested = true;

					this.$postMessage({ id: "saveState", saveState: this.saveState });
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
					if (isDebugScanlineRequested) {
						this.nes.scanline();
					} else if (SYNC_TO_AUDIO) {
						const requestedSamples = SAMPLE_RATE / FPS;
						const newBufferSize = this.availableSamples + requestedSamples;
						if (newBufferSize <= AUDIO_BUFFER_LIMIT)
							this.nes.samples(requestedSamples);
					} else {
						this.nes.frame();
					}

					this.$postMessage(this.samples);
					this.samples = [];
				} catch (error) {
					this.$postMessage({ id: "error", error });
				}
			},
			(fps) => {
				this.$postMessage({ id: "fps", fps });
			}
		);
	}

	onFrame = (frameBuffer) => {
		this.frameTimer.countNewFrame();
		this.$postMessage(frameBuffer);
	};

	onAudio = (sample) => {
		this.samples.push(sample);
	};

	terminate = () => {
		this.frameTimer.stop();
	};

	postMessage = (data) => {
		this.$onMessage({ data });
	};

	$onMessage = ({ data }) => {
		try {
			if (data instanceof Uint8Array) {
				// rom bytes

				this.nes.load(data);
				this.frameTimer.start();
			} else if (Array.isArray(data)) {
				// state packet

				// -> controller input
				for (let i = 0; i < 2; i++) {
					if (i === 0) {
						this.isSaveStateRequested = data[i].$saveState;
						this.isLoadStateRequested = data[i].$loadState;
						if (!data[i].$saveState) this.wasSaveStateRequested = false;
						if (!data[i].$loadState) this.wasLoadStateRequested = false;
						if (data[i].$startDebugging) this.isDebugging = true;
						if (data[i].$stopDebugging) this.isDebugging = false;
						if (data[i].$debugStepFrame) this.isDebugStepFrameRequested = true;
						if (data[i].$debugStepScanline)
							this.isDebugScanlineRequested = true;
					}

					for (let button in data[i])
						if (button[0] !== "$")
							this.nes.setButton(i + 1, button, data[i][button]);
				}

				// -> available samples
				this.availableSamples = data[2];
			} else {
				// metadata
				if (data.id === "saveState") this.saveState = data.saveState;
			}
		} catch (error) {
			this.$postMessage({ id: "error", error });
		}
	};
}
