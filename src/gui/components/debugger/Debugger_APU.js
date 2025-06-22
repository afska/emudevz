const ImGui = window.ImGui;

const MIN = 0;
const MAX = 15;

export default class Debugger_APU {
	constructor() {
		this._zoom = 0.0; // 0 = no zoom (show 100%), 1 = full zoom (show none)
	}

	draw() {
		const emulation = window.EMULATION;

		const mix = emulation?.channelSamples.mix ?? [];
		const pulse1 = emulation?.channelSamples.pulse1 ?? [];
		const pulse2 = emulation?.channelSamples.pulse2 ?? [];
		const triangle = emulation?.channelSamples.triangle ?? [];
		const noise = emulation?.channelSamples.noise ?? [];
		const dmc = emulation?.channelSamples.dmc ?? [];

		ImGui.SliderFloat(
			"Zoom",
			(v = this._zoom) => (this._zoom = v),
			0.0,
			0.9,
			"%.2f"
		);

		const maxN = mix.length;
		const N = Math.floor(maxN * (1 - this._zoom));

		const size = new ImGui.Vec2(0, 80);
		ImGui.PlotLines("Pulse Channel 1", pulse1, N, 0, "", MIN, MAX, size);
		ImGui.PlotLines("Pulse Channel 2", pulse2, N, 0, "", MIN, MAX, size);
		ImGui.PlotLines("Triangle Channel", triangle, N, 0, "", MIN, MAX, size);
		ImGui.PlotLines("Noise Channel", noise, N, 0, "", MIN, MAX, size);
		ImGui.PlotLines("DMC Channel", dmc, N, 0, "", MIN, MAX, size);
		ImGui.PlotLines("Mix", mix, N, 0, "", 0, 0.5, size);

		if (emulation != null && !emulation.isDebugging)
			emulation.resetChannelSamples();
	}
}
