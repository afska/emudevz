import widgets from "./widgets";

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
	constructor(args) {
		this.args = args;
		this.selectedTab = null;

		this._zoom = 0.0;
	}

	draw() {
		const emulation = window.EmuDevz.emulation;
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
		const n = Math.floor(maxN * (1 - this._zoom));

		if (ImGui.BeginTabBar("APUTabs")) {
			this._drawOverviewTab(
				emulation,
				mix,
				pulse1,
				pulse2,
				triangle,
				noise,
				dmc,
				n
			);
			this._drawPulseTab(neees, pulse1, pulse2, maxN);
			this._drawTriangleTab(neees, triangle, maxN);
			this._drawNoiseTab(neees, noise, maxN);
			this._drawDMCTab(neees, dmc, maxN);

			ImGui.EndTabBar();
			this.selectedTab = null;
		}

		if (emulation != null && !emulation.isDebugging)
			emulation.resetChannelSamples();
	}

	destroy() {
		const emulation = window.EmuDevz.emulation;
		if (!emulation) return;

		emulation.enabledChannels.pulse1 = true;
		emulation.enabledChannels.pulse2 = true;
		emulation.enabledChannels.triangle = true;
		emulation.enabledChannels.noise = true;
		emulation.enabledChannels.dmc = true;
	}

	_drawOverviewTab(emulation, mix, pulse1, pulse2, triangle, noise, dmc, n) {
		widgets.simpleTab(this, "Overview", () => {
			if (emulation != null) {
				if (this.args.readOnly) ImGui.BeginDisabled(true);
				ImGui.Checkbox(
					"Pulse 1",
					(val = emulation.enabledChannels.pulse1) =>
						(emulation.enabledChannels.pulse1 = val)
				);
				ImGui.SameLine();
				ImGui.Checkbox(
					"Pulse 2",
					(val = emulation.enabledChannels.pulse2) =>
						(emulation.enabledChannels.pulse2 = val)
				);
				ImGui.SameLine();
				ImGui.Checkbox(
					"Triangle",
					(val = emulation.enabledChannels.triangle) =>
						(emulation.enabledChannels.triangle = val)
				);
				ImGui.SameLine();
				ImGui.Checkbox(
					"Noise",
					(val = emulation.enabledChannels.noise) =>
						(emulation.enabledChannels.noise = val)
				);
				ImGui.SameLine();
				ImGui.Checkbox(
					"DMC",
					(val = emulation.enabledChannels.dmc) =>
						(emulation.enabledChannels.dmc = val)
				);
				if (this.args.readOnly) ImGui.EndDisabled(true);
			}

			if (!this.args.readOnly) {
				widgets.fullWidthFieldWithLabel("Zoom", (label) => {
					ImGui.SliderFloat(
						label,
						(v = this._zoom) => (this._zoom = v),
						0.0,
						0.9,
						"%.2f"
					);
				});
			}

			widgets.simpleTable("pulse1", "Pulse Channel 1", () => {
				widgets.wave(pulse1, n, MIN, MAX);
			});
			widgets.simpleTable("pulse2", "Pulse Channel 2", () => {
				widgets.wave(pulse2, n, MIN, MAX);
			});
			widgets.simpleTable("triangle", "Triangle Channel", () => {
				widgets.wave(triangle, n, MIN, MAX);
			});
			widgets.simpleTable("noise", "Noise Channel", () => {
				widgets.wave(noise, n, MIN, MAX);
			});
			widgets.simpleTable("dmc", "DMC Channel", () => {
				widgets.wave(dmc, n, MIN, MAX);
			});
			widgets.simpleTable("mix", "Mix", () => {
				widgets.wave(mix, n, 0, 0.5);
			});

			widgets.simpleTable("sequencer", "Sequencer", () => {
				widgets.boolean("Use 5-step sequence", true);
			});
		});
	}

	_drawPulseTab(neees, pulse1, pulse2, maxN) {
		widgets.simpleTab(this, "Pulse", () => {
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

				widgets.simpleTable(id, "Pulse Channel " + (i + 1), () => {
					widgets.wave(samples, maxN, MIN, MAX);

					const constantVolume =
						channel?.registers?.control.constantVolume ?? false;
					const volumeOrEnvelopePeriod =
						channel?.registers?.control.volumeOrEnvelopePeriod ?? 0;

					widgets.boolean("Enabled", channel?.isEnabled?.() ?? false);
					ImGui.SameLine();
					widgets.boolean("Constant", constantVolume);
					widgets.value("Timer", channel?.timer ?? 0);
					widgets.value("  => Freq", `${frequency.toFixed(2)} hz`);
					widgets.value("Duty", `${duty} (${DUTY_PERCENTAGES[duty]})`);
					ImGui.SameLine();
					widgets.dutyCycle(DUTY_SEQUENCE[duty]);
					widgets.value("Sample", samples[samples.length - 1] ?? 0);

					widgets.simpleTable(`${id}_lengthcounter`, "Length Counter", () => {
						const count = channel?.lengthCounter?.counter ?? 0;

						widgets.boolean(
							"Halt",
							channel?.registers?.control.envelopeLoopOrLengthCounterHalt ??
								false
						);
						widgets.value("Count", count);
						widgets.progressBar(count / 255);
					});

					widgets.simpleTable(`${id}_volumeenvelope`, "Volume Envelope", () => {
						const volume = channel?.volumeEnvelope?.volume ?? 0;

						widgets.boolean(
							"Start",
							channel?.volumeEnvelope?.startFlag ?? false
						);
						ImGui.SameLine();
						widgets.boolean(
							"Loop",
							channel?.registers?.control.envelopeLoopOrLengthCounterHalt ??
								false
						);

						widgets.value(
							constantVolume ? "Constant volume" : "Divider period",
							volumeOrEnvelopePeriod
						);
						if (!constantVolume) {
							widgets.value(
								"Divider count",
								channel?.volumeEnvelope?.dividerCount ?? 0
							);
							widgets.value("Volume", volume);
						}
						widgets.progressBar(
							(constantVolume ? volumeOrEnvelopePeriod : volume) / 15
						);
					});

					widgets.simpleTable(`${id}_sweep`, "Frequency Sweep", () => {
						widgets.boolean(
							"Enabled",
							channel?.registers?.sweep?.enabledFlag ?? false
						);
						ImGui.SameLine();
						widgets.boolean(
							"Negate",
							channel?.registers?.sweep?.negateFlag ?? false
						);
						widgets.value(
							"Divider period",
							(channel?.registers?.sweep?.dividerPeriodMinusOne ?? 0) + 1
						);
						widgets.value(
							"Divider count",
							channel?.frequencySweep?.dividerCount ?? 0
						);
						widgets.value("Delta", channel?.frequencySweep?.sweepDelta ?? 0);
						widgets.progressBar(frequency / MAX_FREQ);
					});
				});

				if (i === 0) ImGui.NextColumn();
			});

			ImGui.Columns(1);
		});
	}

	_drawTriangleTab(neees, triangle, maxN) {
		widgets.simpleTab(this, "Triangle", () => {
			const channel = neees?.apu.channels?.triangle;
			let frequency = 0;
			if (channel != null) {
				const timer = channel.timer ?? 0;
				frequency = 1789773 / (16 * (timer + 1)) / 2;
			}

			widgets.wave(triangle, maxN, MIN, MAX);

			widgets.boolean("Enabled", channel?.isEnabled?.() ?? false);
			widgets.value("Timer", channel?.timer ?? 0);
			widgets.value("  => Freq", `${frequency.toFixed(2)} hz`);
			widgets.value("Sample", triangle[triangle.length - 1] ?? 0);

			widgets.simpleTable(`triangle_lengthcounter`, "Length Counter", () => {
				const count = channel?.lengthCounter?.counter ?? 0;

				widgets.boolean(
					"Halt",
					channel?.registers?.lengthControl.halt ?? false
				);
				widgets.value("Count", count);
				widgets.progressBar(count / 255);
			});

			widgets.simpleTable(
				`triangle_linearlengthcounter`,
				"Linear Length Counter",
				() => {
					const count = channel?.linearLengthCounter?.counter ?? 0;

					widgets.boolean(
						"Halt",
						channel?.registers?.lengthControl.halt ?? false
					);
					ImGui.SameLine();
					widgets.boolean(
						"Reload",
						channel?.linearLengthCounter?.reloadFlag ?? false
					);
					widgets.value("Count", count);
					widgets.value(
						"Reload value",
						channel?.linearLengthCounter?.reload ?? 0
					);
					widgets.progressBar(count / 255);
				}
			);
		});
	}

	_drawNoiseTab(neees, noise, maxN) {
		widgets.simpleTab(this, "Noise", () => {
			const channel = neees?.apu.channels?.noise;

			widgets.wave(noise, maxN, MIN, MAX);

			const constantVolume =
				channel?.registers?.control.constantVolume ?? false;
			const volumeOrEnvelopePeriod =
				channel?.registers?.control.volumeOrEnvelopePeriod ?? 0;

			widgets.boolean("Enabled", channel?.isEnabled?.());
			ImGui.SameLine();
			widgets.boolean("Constant", constantVolume);
			ImGui.SameLine();
			widgets.boolean("Mode", channel?.registers?.form.mode ?? false);
			widgets.value("Divider period", channel?.registers?.form.period ?? 0);
			widgets.value("Divider count", channel?.count ?? 0);
			widgets.value(
				"Shift",
				"0b" + (channel?.shift ?? 0).toString(2).padStart(15, "0")
			);
			widgets.value("Sample", noise[noise.length - 1] ?? 0);

			widgets.simpleTable(`noise_volumeenvelope`, "Volume Envelope", () => {
				const volume = channel?.volumeEnvelope?.volume ?? 0;

				widgets.boolean("Start", channel?.volumeEnvelope?.startFlag ?? false);
				ImGui.SameLine();
				widgets.boolean(
					"Loop",
					channel?.registers?.control.envelopeLoopOrLengthCounterHalt ?? false
				);

				widgets.value(
					constantVolume ? "Constant volume" : "Divider period",
					volumeOrEnvelopePeriod
				);
				if (!constantVolume) {
					widgets.value(
						"Divider count",
						channel?.volumeEnvelope?.dividerCount ?? 0
					);
					widgets.value("Volume", volume);
				}
				widgets.progressBar(
					(constantVolume ? volumeOrEnvelopePeriod : volume) / 15
				);
			});

			widgets.simpleTable(`noise_lengthcounter`, "Length Counter", () => {
				const count = channel?.lengthCounter?.counter ?? 0;

				widgets.boolean(
					"Halt",
					channel?.registers?.control.envelopeLoopOrLengthCounterHalt ?? false
				);
				widgets.value("Count", count);
				widgets.progressBar(count / 255);
			});
		});
	}

	_drawDMCTab(neees, dmc, maxN) {
		widgets.simpleTab(this, "DMC", () => {
			const channel = neees?.apu.channels?.dmc;

			widgets.wave(dmc, maxN, MIN, MAX);

			widgets.boolean("Enabled", channel?.isEnabled?.());
			widgets.value("Sample", dmc[dmc.length - 1] ?? 0);

			widgets.simpleTable("dmc_dpcm", "DPCM", () => {
				const cursorByte = channel?.dpcm?.cursorByte ?? 0;
				const cursorBit = channel?.dpcm?.cursorBit ?? 0;
				const sampleLength = channel?.dpcm?.sampleLength ?? 0;

				widgets.boolean("Start", channel?.dpcm?.startFlag ?? false);
				ImGui.SameLine();
				widgets.boolean("Active", channel?.dpcm?.isActive ?? false);
				widgets.value("Buffer", channel?.dpcm?.buffer || 0);
				widgets.value("Cursor (byte)", cursorByte);
				widgets.value("Cursor (bit)", cursorBit);
				widgets.value("Divider period", channel?.dpcm?.dividerPeriod ?? 0);
				widgets.value("Divider count", channel?.dpcm?.dividerCount ?? 0);
				widgets.value(
					"Sample address",
					"0x" +
						(channel?.dpcm?.sampleAddress ?? 0).toString(16).padStart(4, "0")
				);
				widgets.value("Sample length", sampleLength);

				widgets.progressBar(
					(cursorByte * 8 + cursorBit) / Math.max(sampleLength * 8, 1)
				);
			});
		});
	}
}
