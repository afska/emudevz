import utils from "./utils";

const ImGui = window.ImGui;

const MIN = 0;
const MAX = 15;
const MAX_FREQ = 800;

export default class Debugger_APU {
	constructor() {
		this._zoom = 0.0;
	}

	draw() {
		const emulation = window.EMULATION;

		const mix = emulation?.channelSamples.mix ?? [];
		const pulse1 = emulation?.channelSamples.pulse1 ?? [];
		const pulse2 = emulation?.channelSamples.pulse2 ?? [];
		const triangle = emulation?.channelSamples.triangle ?? [];
		const noise = emulation?.channelSamples.noise ?? [];
		const dmc = emulation?.channelSamples.dmc ?? [];
		const apu = {};

		if (ImGui.BeginTabBar("APUTabs")) {
			utils.simpleTab("Overview", () => {
				utils.fullWidthFieldWithLabel("Zoom", (label) => {
					ImGui.SliderFloat(
						label,
						(v = this._zoom) => (this._zoom = v),
						0.0,
						0.9,
						"%.2f"
					);
				});

				const maxN = mix.length;
				const N = Math.floor(maxN * (1 - this._zoom));
				const height = 40;

				utils.simpleTable("pulse1", "Pulse Channel 1", () => {
					const waveSize = new ImGui.Vec2(
						ImGui.GetContentRegionAvail().x,
						height
					);
					ImGui.PlotLines("", pulse1, N, 0, "", MIN, MAX, waveSize);
				});
				utils.simpleTable("pulse2", "Pulse Channel 2", () => {
					const waveSize = new ImGui.Vec2(
						ImGui.GetContentRegionAvail().x,
						height
					);
					ImGui.PlotLines("", pulse2, N, 0, "", MIN, MAX, waveSize);
				});
				utils.simpleTable("triangle", "Triangle Channel", () => {
					const waveSize = new ImGui.Vec2(
						ImGui.GetContentRegionAvail().x,
						height
					);
					ImGui.PlotLines("", triangle, N, 0, "", MIN, MAX, waveSize);
				});
				utils.simpleTable("noise", "Noise Channel", () => {
					const waveSize = new ImGui.Vec2(
						ImGui.GetContentRegionAvail().x,
						height
					);
					ImGui.PlotLines("", noise, N, 0, "", MIN, MAX, waveSize);
				});
				utils.simpleTable("dmc", "DMC Channel", () => {
					const waveSize = new ImGui.Vec2(
						ImGui.GetContentRegionAvail().x,
						height
					);
					ImGui.PlotLines("", dmc, N, 0, "", MIN, MAX, waveSize);
				});
				utils.simpleTable("mix", "Mix", () => {
					const waveSize = new ImGui.Vec2(
						ImGui.GetContentRegionAvail().x,
						height
					);
					ImGui.PlotLines("Mix", mix, N, 0, "", 0, 0.5, waveSize);
				});

				utils.simpleTable("sequencer", "Sequencer", () => {
					utils.boolean("Use 5-step sequence", true);
				});
			});

			utils.simpleTab("Pulse", () => {
				ImGui.Columns(2, "PulseCols", false);
				["pulse1", "pulse2"].forEach((id, i) => {
					utils.simpleTable(id, "Pulse Channel " + (i + 1), () => {
						utils.boolean("Enabled", true);
						utils.boolean("Constant volume", true);
						utils.value("timer", 123);
						utils.value("freq", 123);
						utils.value("duty", 2); // TODO: PlotLines
						utils.value("sample", 15);

						utils.simpleTable(`${id}_lengthcounter`, "Length Counter", () => {
							const count = apu.p1?.length?.count ?? 0;

							utils.boolean("halt", true);
							utils.value("count", count);
							ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 0));
						});

						utils.simpleTable(`${id}_volumeenvelope`, "Volume Envelope", () => {
							const vol = apu.p1?.envVolume ?? 0;

							utils.boolean("start", true);
							ImGui.SameLine();
							utils.boolean("loop", true);

							utils.value("divider period", 1);
							utils.value("divider count", 3);
							utils.value("volume", vol);
							ImGui.ProgressBar(vol / 15, new ImGui.Vec2(-1, 0));
						});

						utils.simpleTable(`${id}_sweep`, "Frequency Sweep", () => {
							utils.boolean("enabled", true);
							utils.boolean("negate", true);
							utils.value("period", 2);
							utils.value("delta", 14);
							ImGui.ProgressBar(
								(apu.freq ?? 0) / MAX_FREQ,
								new ImGui.Vec2(-1, 0)
							);
						});
					});

					if (i === 0) ImGui.NextColumn();
				});
				ImGui.Columns(1);
			});

			ImGui.EndTabBar();
		}

		if (emulation != null && !emulation.isDebugging)
			emulation.resetChannelSamples();
	}
}
