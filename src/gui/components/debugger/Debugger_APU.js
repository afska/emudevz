import utils from "./utils";

const ImGui = window.ImGui;

const MIN = 0;
const MAX = 15;

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
			const waveSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x, height);
			ImGui.PlotLines("", pulse1, N, 0, "", MIN, MAX, waveSize);
		});
		utils.simpleTable("pulse2", "Pulse Channel 2", () => {
			const waveSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x, height);
			ImGui.PlotLines("", pulse2, N, 0, "", MIN, MAX, waveSize);
		});
		utils.simpleTable("triangle", "Triangle Channel", () => {
			const waveSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x, height);
			ImGui.PlotLines("", triangle, N, 0, "", MIN, MAX, waveSize);
		});
		utils.simpleTable("noise", "Noise Channel", () => {
			const waveSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x, height);
			ImGui.PlotLines("", noise, N, 0, "", MIN, MAX, waveSize);
		});
		utils.simpleTable("dmc", "DMC Channel", () => {
			const waveSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x, height);
			ImGui.PlotLines("", dmc, N, 0, "", MIN, MAX, waveSize);
		});
		utils.simpleTable("mix", "Mix", () => {
			const waveSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x, height);
			ImGui.PlotLines("Mix", mix, N, 0, "", 0, 0.5, waveSize);
		});

		if (emulation != null && !emulation.isDebugging)
			emulation.resetChannelSamples();
	}
}
