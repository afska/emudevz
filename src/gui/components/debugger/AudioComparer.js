import { GenericDebugger } from "../Debugger";
import widgets from "./widgets";

const ImGui = window.ImGui;

// Knobs
const WAVE_HEIGHT = 20;
const COLOR_FAIL = "#d9534f";
const COLOR_ACTUAL_WAVE = "#e5c07b";
const COLOR_EXPECTED_WAVE = "#577295";

const MIN = 0;
const MAX = 15;

export default GenericDebugger(
	class AudioComparer {
		init() {
			this.progressValue = 0;
			this.progressText = "";
			this.didFail = false;

			this.samplesA = null;
			this.samplesB = null;
		}

		draw() {
			ImGui.PushStyleVar(ImGui.StyleVar.WindowBorderSize, 0);

			widgets.window(
				"Audio test",
				{ margin: 10, flags: ImGui.WindowFlags.NoTitleBar },
				() => {
					widgets.withWaveColor(this.didFail ? COLOR_FAIL : null, () => {
						widgets.progressBar(this.progressValue / 100, this.progressText);
					});

					ImGui.Columns(2, "ComparerCols", false);
					this._drawWaves(this.emulationA, COLOR_ACTUAL_WAVE, this.samplesA);
					ImGui.NextColumn();
					this._drawWaves(this.emulationB, COLOR_EXPECTED_WAVE, this.samplesB);
				}
			);

			ImGui.PopStyleVar();
		}

		destroy() {}

		_drawWaves(emulation, color, finalSamples) {
			if (!emulation) return;

			let mix = finalSamples?.mix ?? emulation?.channelSamples.mix ?? [];
			let pulse1 =
				finalSamples?.pulse1 ?? emulation?.channelSamples.pulse1 ?? [];
			let pulse2 =
				finalSamples?.pulse2 ?? emulation?.channelSamples.pulse2 ?? [];
			let triangle =
				finalSamples?.triangle ?? emulation?.channelSamples.triangle ?? [];
			let noise = finalSamples?.noise ?? emulation?.channelSamples.noise ?? [];
			let dmc = finalSamples?.dmc ?? emulation?.channelSamples.dmc ?? [];

			if (mix.length > 0) {
				this._lastMix = mix;
				this._lastPulse1 = pulse1;
				this._lastPulse2 = pulse2;
				this._lastTriangle = triangle;
				this._lastNoise = noise;
				this._lastDMC = dmc;
			} else if (this._lastMix != null && this._lastMix.length > 0) {
				mix = this._lastMix;
				pulse1 = this._lastPulse1;
				pulse2 = this._lastPulse2;
				triangle = this._lastTriangle;
				noise = this._lastNoise;
				dmc = this._lastDMC;
			}

			const n = mix.length;

			widgets.withWaveColor(color, () => {
				widgets.simpleSection("Mix", () => {
					widgets.wave(mix, n, 0, 0.5, WAVE_HEIGHT);
				});
				widgets.simpleSection("Pulse Channel 1", () => {
					widgets.wave(pulse1, n, MIN, MAX, WAVE_HEIGHT);
				});
				widgets.simpleSection("Pulse Channel 2", () => {
					widgets.wave(pulse2, n, MIN, MAX, WAVE_HEIGHT);
				});
				widgets.simpleSection("Triangle Channel", () => {
					widgets.wave(triangle, n, MIN, MAX, WAVE_HEIGHT);
				});
				widgets.simpleSection("Noise Channel", () => {
					widgets.wave(noise, n, MIN, MAX, WAVE_HEIGHT);
				});
				widgets.simpleSection("DMC Channel", () => {
					widgets.wave(dmc, n, MIN, MAX, WAVE_HEIGHT);
				});
			});
		}
	}
);
