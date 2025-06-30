import { GenericDebugger } from "../Debugger";
import utils from "./utils";

const ImGui = window.ImGui;

const MIN = 0;
const MAX = 15;

export default GenericDebugger(
	class AudioComparer {
		init() {
			this.progressValue = 0;
			this.progressText = "";
		}

		draw() {
			const m = 0;
			ImGui.SetNextWindowPos(new ImGui.ImVec2(m, m), ImGui.Cond.FirstUseEver);
			const io = ImGui.GetIO();
			ImGui.SetNextWindowSize(
				new ImGui.ImVec2(io.DisplaySize.x - m * 2, io.DisplaySize.y - m * 2)
			);
			ImGui.PushStyleVar(ImGui.StyleVar.WindowBorderSize, 0);
			ImGui.Begin(
				"Audio test",
				null,
				ImGui.WindowFlags.NoTitleBar |
					ImGui.WindowFlags.NoMove |
					ImGui.WindowFlags.NoResize |
					ImGui.WindowFlags.NoCollapse
			);

			ImGui.ProgressBar(
				this.progressValue / 100,
				new ImGui.Vec2(-1, 16),
				this.progressText
			);

			ImGui.Columns(2, "ComparerCols", false);
			this._drawWaves(this.emulationA);
			ImGui.NextColumn();
			this._drawWaves(this.emulationB);

			ImGui.End();
			ImGui.PopStyleVar();
		}

		destroy() {}

		_drawWaves(emulation) {
			if (!emulation) return;

			let mix = emulation?.channelSamples.mix ?? [];
			let pulse1 = emulation?.channelSamples.pulse1 ?? [];
			let pulse2 = emulation?.channelSamples.pulse2 ?? [];
			let triangle = emulation?.channelSamples.triangle ?? [];
			let noise = emulation?.channelSamples.noise ?? [];
			let dmc = emulation?.channelSamples.dmc ?? [];

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

			const N = mix.length;
			const height = 20;

			utils.simpleSection("pulse1", "Pulse Channel 1", () => {
				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", pulse1, N, 0, "", MIN, MAX, waveSize);
			});
			utils.simpleSection("pulse2", "Pulse Channel 2", () => {
				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", pulse2, N, 0, "", MIN, MAX, waveSize);
			});
			utils.simpleSection("triangle", "Triangle Channel", () => {
				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", triangle, N, 0, "", MIN, MAX, waveSize);
			});
			utils.simpleSection("noise", "Noise Channel", () => {
				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", noise, N, 0, "", MIN, MAX, waveSize);
			});
			utils.simpleSection("dmc", "DMC Channel", () => {
				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", dmc, N, 0, "", MIN, MAX, waveSize);
			});
			utils.simpleSection("mix", "Mix", () => {
				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", mix, N, 0, "", 0, 0.5, waveSize);
			});
		}
	}
);
