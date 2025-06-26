import utils from "./utils";

const ImGui = window.ImGui;

const MIN = 0;
const MAX = 15;
const MAX_FREQ = 800;
const DUTY_SEQUENCE = [
	[1, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 0, 0, 0, 0],
	[0, 0, 1, 1, 1, 1, 1, 1],
];

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
						ImGui.SameLine();
						utils.boolean("Constant", true);
						utils.value("Timer", 123);
						utils.value("  => Freq", "123 hz");
						utils.value("Duty", "3 (75%)");
						ImGui.SameLine();
						const dutyWave = DUTY_SEQUENCE[3];
						ImGui.PlotHistogram(
							"",
							dutyWave,
							dutyWave.length,
							0,
							"",
							0,
							1,
							new ImGui.Vec2(80, 16)
						);
						utils.value("Sample", 15);
						ImGui.NewLine();

						utils.simpleTable(`${id}_lengthcounter`, "Length Counter", () => {
							const count = 40; //apu.p1?.length?.count ?? 0;

							utils.boolean("Halt", true);
							utils.value("Count", count);
							ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
						});

						utils.simpleTable(`${id}_volumeenvelope`, "Volume Envelope", () => {
							const vol = 4; //apu.p1?.envVolume ?? 0;

							utils.boolean("Start", true);
							ImGui.SameLine();
							utils.boolean("Loop", true);

							utils.value("Divider period", 1);
							utils.value("Divider count", 3);
							utils.value("Volume", vol);
							ImGui.ProgressBar(vol / 255, new ImGui.Vec2(-1, 16));
						});

						utils.simpleTable(`${id}_sweep`, "Frequency Sweep", () => {
							utils.boolean("Enabled", true);
							ImGui.SameLine();
							utils.boolean("Negate", true);
							utils.value("Divider period", 1);
							utils.value("Divider count", 3);
							utils.value("Delta", 14);
							ImGui.ProgressBar(200 / MAX_FREQ, new ImGui.Vec2(-1, 16));
						});
					});

					if (i === 0) ImGui.NextColumn();
				});
				ImGui.Columns(1);
			});

			utils.simpleTab("Triangle", () => {
				utils.boolean("Enabled", true);
				utils.value("Timer", 123);
				utils.value("  => Freq", "123 hz");
				utils.value("Sample", 15);
				ImGui.NewLine();

				utils.simpleTable(`triangle_lengthcounter`, "Length Counter", () => {
					const count = 40; //apu.p1?.length?.count ?? 0;

					utils.boolean("Halt", true);
					utils.value("Count", count);
					ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
				});

				utils.simpleTable(
					`triangle_linearlengthcounter`,
					"Linear Length Counter",
					() => {
						const count = 40; //apu.p1?.length?.count ?? 0;

						utils.boolean("Halt", true);
						utils.value("Count", count);
						utils.boolean("Reload", true);
						utils.value("Reload value", count);
						ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
					}
				);
			});

			utils.simpleTab("Noise", () => {
				utils.boolean("Enabled", true);
				ImGui.SameLine();
				utils.boolean("Constant", true);
				utils.boolean("Mode", true);
				utils.value("Divider period", 2);
				utils.value("Divider count", 2);
				utils.value("Shift", "0b01000100");
				utils.value("Sample", 15);
				ImGui.NewLine();

				utils.simpleTable(`noise_volumeenvelope`, "Volume Envelope", () => {
					const vol = 4; //apu.p1?.envVolume ?? 0;

					utils.boolean("Start", true);
					ImGui.SameLine();
					utils.boolean("Loop", true);

					utils.value("Divider period", 1);
					utils.value("Divider count", 3);
					utils.value("Volume", vol);
					ImGui.ProgressBar(vol / 255, new ImGui.Vec2(-1, 16));
				});

				utils.simpleTable(`noise_lengthcounter`, "Length Counter", () => {
					const count = 40; //apu.p1?.length?.count ?? 0;

					utils.boolean("Halt", true);
					utils.value("Count", count);
					ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
				});
			});

			ImGui.EndTabBar();
		}

		if (emulation != null && !emulation.isDebugging)
			emulation.resetChannelSamples();
	}
}
