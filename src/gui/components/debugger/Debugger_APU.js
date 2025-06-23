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
					ImGui.BeginDisabled(true);
					ImGui.Checkbox(
						"Use 5-step sequence",
						() => true //apu.sequence5Step ?? false
					);
					ImGui.EndDisabled(); // TODO: EXTRACT HELPER FOR CHECKBOXES
				});
			});

			utils.simpleTab("Pulse", () => {
				ImGui.Columns(2, "PulseCols", false);
				["pulse1", "pulse2"].forEach((id, i) => {
					utils.simpleTable(id, "Pulse Channel " + (i + 1), () => {
						ImGui.Checkbox(`enabled##${id}`, () => apu.p1?.enabled ?? false);
						ImGui.Checkbox(
							`constant volume##${id}_constantvolume`,
							() => apu.p1?.constantVol ?? false
						);

						ImGui.TextDisabled(`timer = ${apu.p1?.timer ?? 0}`); // TODO: EXTRACT HELPER FOR VALUE LOGGING
						ImGui.TextDisabled(`freq = ${apu.p1?.timerFreq ?? 0} hz`);
						ImGui.TextDisabled(`duty = ${apu.p1?.duty ?? 0}`);
						ImGui.TextDisabled(`sample = ${apu.p1?.sample ?? 0}`);

						utils.simpleTable(`${id}_lengthcounter`, "Length Counter", () => {
							ImGui.Checkbox(
								`halt##${id}_lengthcounter_halt`,
								() => apu.p1?.length?.halt ?? false
							);
							const count = apu.p1?.length?.count ?? 0;
							ImGui.TextDisabled(`count = ${count}`);
							ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 0));
						});

						utils.simpleTable(`${id}_volumeenvelope`, "Volume Envelope", () => {
							ImGui.Checkbox(
								`start##${id}_volumeenvelope`,
								() => apu.p1?.envStart ?? false
							);
							ImGui.SameLine();
							ImGui.Checkbox(
								`loop##${id}_volumeenvelope_loop`,
								() => apu.p1?.envLoop ?? false
							);
							ImGui.TextDisabled(`divider period = ${apu.p1?.envPeriod ?? 0}`);
							ImGui.TextDisabled(`divider count = ${apu.p1?.envCount ?? 0}`);
							const vol = apu.p1?.envVolume ?? 0;
							ImGui.TextDisabled(`volume = ${vol}`);
							ImGui.ProgressBar(vol / 15, new ImGui.Vec2(-1, 0));
						});

						utils.simpleTable(`${id}_sweep`, "Frequency Sweep", () => {
							ImGui.Checkbox(
								`enabled##${id}_sweep`,
								() => apu.p1?.sweepEn ?? false
							);
							ImGui.Checkbox(
								`negate##${id}_sweep`,
								() => apu.p1?.sweepNeg ?? false
							);
							ImGui.TextDisabled(`period = ${apu.p1?.sweepPeriod ?? 0}`);
							ImGui.TextDisabled(`delta = ${apu.p1?.sweepShift ?? 0}`);
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
