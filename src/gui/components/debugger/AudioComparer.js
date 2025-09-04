import music from "../../sound/music";
import { GenericDebugger } from "../Debugger";
import Speaker from "../emulator/runner/Speaker";
import widgets from "./widgets";

const ImGui = window.ImGui;

// Knobs
const WAVE_HEIGHT = 20;
const COLOR_FAIL = "#d9534f";
const COLOR_ACTUAL_WAVE = "#e5c07b";
const COLOR_EXPECTED_WAVE = "#577295";
const VOLUME = 0.1;
const NON_MIX_FACTOR = 0.01;
const VIEW_WINDOW_SIZE = 500;

const MIN = 0;
const MAX = 15;

export default GenericDebugger(
	class AudioComparer {
		init() {
			this.progressValue = 0;
			this.progressText = "";
			this.didFail = false;
			this.finalSamples = null;

			this._player = null;
			this._currentSamples = null;
			this._trimPercent = 100;
		}

		draw() {
			ImGui.PushStyleVar(ImGui.StyleVar.WindowBorderSize, 0);

			widgets.window(
				"Audio test",
				{ margin: 10, flags: ImGui.WindowFlags.NoTitleBar },
				() => {
					widgets.withWaveColor(this.didFail ? COLOR_FAIL : null, () => {
						if (this.progressValue === 100) {
							widgets.fullWidthFieldWithLabel("", (label) => {
								const disable = !!this._player;
								if (disable) ImGui.BeginDisabled(true);
								ImGui.SliderInt(
									label,
									(v = this._trimPercent) => (this._trimPercent = v),
									0,
									100,
									"%d"
								);
								if (disable) ImGui.EndDisabled();
							});
						} else {
							widgets.progressBar(this.progressValue / 100, this.progressText);
						}
					});

					ImGui.Columns(2, "ComparerCols", false);
					this._drawWaves(this.emulationA, COLOR_ACTUAL_WAVE, "A");
					ImGui.NextColumn();
					this._drawWaves(this.emulationB, COLOR_EXPECTED_WAVE, "B");
				}
			);

			ImGui.PopStyleVar();
		}

		destroy() {
			this._stopSpeaker();
		}

		_drawWaves(emulation, color, which) {
			if (!emulation) return;

			this._source =
				this.finalSamples != null
					? this.finalSamples[which]
					: emulation.channelSamples;

			const mix = this._source.mix;
			const pulse1 = this._source.pulse1;
			const pulse2 = this._source.pulse2;
			const triangle = this._source.triangle;
			const noise = this._source.noise;
			const dmc = this._source.dmc;
			const n0 = mix.length;
			const n =
				this.progressValue === 100
					? Math.floor((n0 * this._trimPercent) / 100)
					: n0;

			widgets.withWaveColor(color, () => {
				this._sectionWithButton(
					"Mix",
					mix,
					this._source.mix,
					n,
					0,
					0.5,
					WAVE_HEIGHT,
					which,
					"mix"
				);
				this._sectionWithButton(
					"Pulse Channel 1",
					pulse1,
					this._source.pulse1,
					n,
					MIN,
					MAX,
					WAVE_HEIGHT,
					which,
					"pulse1"
				);
				this._sectionWithButton(
					"Pulse Channel 2",
					pulse2,
					this._source.pulse2,
					n,
					MIN,
					MAX,
					WAVE_HEIGHT,
					which,
					"pulse2"
				);
				this._sectionWithButton(
					"Triangle Channel",
					triangle,
					this._source.triangle,
					n,
					MIN,
					MAX,
					WAVE_HEIGHT,
					which,
					"triangle"
				);
				this._sectionWithButton(
					"Noise Channel",
					noise,
					this._source.noise,
					n,
					MIN,
					MAX,
					WAVE_HEIGHT,
					which,
					"noise"
				);
				this._sectionWithButton(
					"DMC Channel",
					dmc,
					this._source.dmc,
					n,
					MIN,
					MAX,
					WAVE_HEIGHT,
					which,
					"dmc"
				);
			});
		}

		_sectionWithButton(
			label,
			samples,
			fullSamples,
			n,
			min,
			max,
			height,
			which,
			key
		) {
			const isTesting = this.progressValue < 100;
			const isPlaying = this._isPlaying(which, key);
			const icon = isPlaying ? "[||]" : "[>>]";

			if (isTesting) ImGui.BeginDisabled(true);
			if (ImGui.Button(icon + "##" + which + "_" + key))
				this._togglePlay(fullSamples, which, key);
			if (isTesting) ImGui.EndDisabled();

			ImGui.SameLine();
			ImGui.AlignTextToFramePadding();
			ImGui.Text(label);

			let view = samples;
			let viewN = n;
			if (
				this.progressValue === 100 &&
				this._trimPercent !== 100 &&
				!isPlaying
			) {
				const center = n > 0 ? n - 1 : 0;
				let start = center - VIEW_WINDOW_SIZE;
				let end = center + VIEW_WINDOW_SIZE;
				if (start < 0) {
					end += -start;
					start = 0;
				}
				if (end > samples.length) {
					start -= end - samples.length;
					end = samples.length;
					if (start < 0) start = 0;
				}
				view = samples.slice(start, end);
				viewN = view.length;
			}

			const showSamples =
				isPlaying && this._currentSamples ? this._currentSamples : view;
			const showN =
				isPlaying && this._currentSamples ? this._currentSamples.length : viewN;

			widgets.wave(showSamples, showN, min, max, height);
		}

		_isPlaying(which, key) {
			return !!(this._player?.id === which + "_" + key);
		}

		_togglePlay(fullSamples, which, key) {
			if (this._isPlaying(which, key)) {
				music.resume();
				this._stopSpeaker();
			} else {
				music.pause();
				this._startSpeaker(fullSamples, which, key);
			}
		}

		async _startSpeaker(fullSamples, which, key) {
			this._stopSpeaker();

			const id = which + "_" + key;
			this._trimPercent = 100;

			try {
				let index = 0;
				const speaker = new Speaker(({ need }) => {
					try {
						if (!this._player || this._player.id !== id) return;
						if (index >= fullSamples.length) {
							this._stopSpeaker();
							return;
						}
						const count = Math.min(need, fullSamples.length - index);
						const newSamples = fullSamples.slice(index, index + count);
						this._currentSamples = newSamples;
						index += count;
						speaker.writeSamples(newSamples);
					} catch {
						this._stopSpeaker();
					}
				}, VOLUME * (key !== "mix" ? NON_MIX_FACTOR : 1));

				await speaker.start();
				this._player = { speaker, id };
			} catch (e) {
				console.error(e);
				alert("💥💥💥💥💥");
			}
		}

		_stopSpeaker() {
			this._player?.speaker?.stop();
			this._player = null;
			this._currentSamples = null;
		}
	}
);
