import utils from "./utils";

const ImGui = window.ImGui;

const MIN = 0;
const MAX = 15;
const MAX_FREQ = 1000;
const DUTY_SEQUENCE = [
	[1, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 0, 0, 0, 0],
	[0, 0, 1, 1, 1, 1, 1, 1],
];
const DUTY_PERCENTAGES = ["12.5%", "25%", "50%", "75"];

export default class Debugger_APU {
	constructor() {
		this._zoom = 0.0;
	}

	draw() {
		const emulation = window.EMULATION;
		const neees = emulation?.neees;

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

		const maxN = mix.length;
		const N = Math.floor(maxN * (1 - this._zoom));
		const height = 40;

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
					const samples = i === 0 ? pulse1 : pulse2;
					const channel = neees?.apu.channels?.pulses?.[i];
					let frequency = 0,
						duty = 0;
					if (channel != null) {
						const timer = channel.timer ?? 0;
						frequency = 1789773 / (16 * (timer + 1));
						duty = channel.registers?.control.dutyCycleId;
					}

					utils.simpleTable(id, "Pulse Channel " + (i + 1), () => {
						const waveSize = new ImGui.Vec2(
							ImGui.GetContentRegionAvail().x,
							height
						);
						ImGui.PlotLines("", samples, maxN, 0, "", MIN, MAX, waveSize);

						utils.boolean("Enabled", channel?.isEnabled?.() ?? false);
						ImGui.SameLine();
						utils.boolean(
							"Constant",
							channel?.registers?.control.constantVolume ?? false
						);
						utils.value("Timer", channel?.timer ?? 0);
						utils.value("  => Freq", `${frequency.toFixed(2)} hz`);
						utils.value("Duty", `${duty} (${DUTY_PERCENTAGES[duty]})`);
						ImGui.SameLine();
						const dutyWave = DUTY_SEQUENCE[duty];
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
						utils.value("Sample", samples[samples.length - 1] ?? 0);

						utils.simpleTable(`${id}_lengthcounter`, "Length Counter", () => {
							const count = channel?.lengthCounter?.count ?? 0;

							utils.boolean(
								"Halt",
								channel?.registers?.control.envelopeLoopOrLengthCounterHalt ??
									false
							);
							utils.value("Count", count);
							ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
						});

						utils.simpleTable(`${id}_volumeenvelope`, "Volume Envelope", () => {
							const volume = channel?.volumeEnvelope?.volume ?? 0;

							utils.boolean(
								"Start",
								channel?.volumeEnvelope?.startFlag ?? false
							);
							ImGui.SameLine();
							utils.boolean(
								"Loop",
								channel?.registers?.control.envelopeLoopOrLengthCounterHalt ??
									false
							);

							utils.value(
								"Divider period",
								channel?.registers?.control.volumeOrEnvelopePeriod ?? 0
							);
							utils.value(
								"Divider count",
								channel?.volumeEnvelope?.dividerCount ?? 0
							);
							utils.value("Volume", volume);
							ImGui.ProgressBar(volume / 15, new ImGui.Vec2(-1, 16));
						});

						utils.simpleTable(`${id}_sweep`, "Frequency Sweep", () => {
							utils.boolean(
								"Enabled",
								channel?.registers?.sweep?.enabledFlag ?? false
							);
							ImGui.SameLine();
							utils.boolean(
								"Negate",
								channel?.registers?.sweep?.negateFlag ?? false
							);
							utils.value(
								"Divider period",
								(channel?.registers?.sweep?.dividerPeriodMinusOne ?? 0) + 1
							);
							utils.value(
								"Divider count",
								channel?.frequencySweep?.dividerCount ?? 0
							);
							utils.value("Delta", channel?.frequencySweep?.sweepDelta ?? 0);
							ImGui.ProgressBar(frequency / MAX_FREQ, new ImGui.Vec2(-1, 16));
						});
					});

					if (i === 0) ImGui.NextColumn();
				});
				ImGui.Columns(1);
			});

			utils.simpleTab("Triangle", () => {
				const channel = neees?.apu.channels?.triangle;
				let frequency = 0;
				if (channel != null) {
					const timer = channel.timer ?? 0;
					frequency = 1789773 / (16 * (timer + 1)) / 2;
				}

				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", triangle, maxN, 0, "", MIN, MAX, waveSize);

				utils.boolean("Enabled", channel?.isEnabled?.() ?? false);
				utils.value("Timer", channel?.timer ?? 0);
				utils.value("  => Freq", `${frequency.toFixed(2)} hz`);
				utils.value("Sample", triangle[triangle.length - 1] ?? 0);

				utils.simpleTable(`triangle_lengthcounter`, "Length Counter", () => {
					const count = channel?.lengthCounter?.count ?? 0;

					utils.boolean("Halt", channel?.registers?.linearLCL.halt ?? false);
					utils.value("Count", count);
					ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
				});

				utils.simpleTable(
					`triangle_linearlengthcounter`,
					"Linear Length Counter",
					() => {
						const count = channel?.linearLengthCounter?.count ?? 0;

						utils.boolean("Halt", channel?.registers?.linearLCL.halt ?? false);
						ImGui.SameLine();
						utils.boolean(
							"Reload",
							channel?.linearLengthCounter?.reloadFlag ?? false
						);
						utils.value("Count", count);
						utils.value(
							"Reload value",
							channel?.linearLengthCounter?.reload ?? 0
						);
						ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
					}
				);
			});

			utils.simpleTab("Noise", () => {
				const channel = neees?.apu.channels?.noise;

				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", noise, maxN, 0, "", MIN, MAX, waveSize);

				utils.boolean("Enabled", channel?.isEnabled?.());
				ImGui.SameLine();
				utils.boolean(
					"Constant",
					channel?.registers?.control.constantVolume ?? false
				);
				ImGui.SameLine();
				utils.boolean("Mode", channel?.registers?.form.mode ?? false);
				utils.value(
					"Divider period",
					channel?.registers?.control.volumeOrEnvelopePeriod ?? 0
				);
				utils.value(
					"Divider count",
					channel?.volumeEnvelope?.dividerCount ?? 0
				);
				utils.value(
					"Shift",
					"0b" + (channel?.shift ?? 0).toString(2).padStart(15, "0")
				);
				utils.value("Sample", noise[noise.length - 1] ?? 0);

				utils.simpleTable(`noise_volumeenvelope`, "Volume Envelope", () => {
					const volume = channel?.volumeEnvelope?.volume ?? 0;

					utils.boolean("Start", channel?.volumeEnvelope?.startFlag ?? false);
					ImGui.SameLine();
					utils.boolean(
						"Loop",
						channel?.registers?.control.envelopeLoopOrLengthCounterHalt ?? false
					);

					utils.value(
						"Divider period",
						channel?.registers?.control.volumeOrEnvelopePeriod ?? 0
					);
					utils.value(
						"Divider count",
						channel?.volumeEnvelope?.dividerCount ?? 0
					);
					utils.value("Volume", volume);
					ImGui.ProgressBar(volume / 15, new ImGui.Vec2(-1, 16));
				});

				utils.simpleTable(`noise_lengthcounter`, "Length Counter", () => {
					const count = channel?.lengthCounter?.count ?? 0;

					utils.boolean(
						"Halt",
						channel?.registers?.control.envelopeLoopOrLengthCounterHalt ?? false
					);
					utils.value("Count", count);
					ImGui.ProgressBar(count / 255, new ImGui.Vec2(-1, 16));
				});
			});

			utils.simpleTab("DMC", () => {
				const channel = neees?.apu.channels?.dmc;

				const waveSize = new ImGui.Vec2(
					ImGui.GetContentRegionAvail().x,
					height
				);
				ImGui.PlotLines("", dmc, maxN, 0, "", MIN, MAX, waveSize);

				utils.boolean("Enabled", channel?.isEnabled?.());
				utils.value("Sample", dmc[dmc.length - 1] ?? 0);

				utils.simpleTable("dmc_dpcm", "DPCM", () => {
					const cursorByte = channel?.cursorByte ?? 0;
					const cursorBit = channel?.cursorBit ?? 0;
					const sampleLength = channel?.sampleLength ?? 0;

					utils.boolean("Start", channel?.startFlag ?? false);
					ImGui.SameLine();
					utils.boolean("Active", channel?.isUsingDPCM ?? false);
					utils.value("Buffer", channel?.buffer ?? 0);
					utils.value("Cursor (byte)", cursorByte);
					utils.value("Cursor (bit)", cursorBit);
					utils.value("Divider period", channel?.dividerPeriod ?? 0);
					utils.value("Divider count", channel?.dividerCount ?? 0);
					utils.value(
						"Sample address",
						"0x" + (channel?.sampleAddress ?? 0).toString(16).padStart(4, "0")
					);
					utils.value("Sample length", sampleLength);

					ImGui.ProgressBar(
						(cursorByte * 8 + cursorBit) / Math.max(sampleLength * 8, 1),
						new ImGui.Vec2(-1, 16)
					);
				});
			});

			ImGui.EndTabBar();
		}

		if (emulation != null && !emulation.isDebugging)
			emulation.resetChannelSamples();
	}
}
