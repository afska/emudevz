const ImGui = window.ImGui;

export default class Debugger_APU {
	draw() {
		const N = 100;
		// example wave data
		const square1 = Array.from({ length: N }, (_, i) => (i % 20 < 10 ? 1 : -1));
		const square2 = Array.from({ length: N }, (_, i) => (i % 40 < 10 ? 1 : -1));
		const triangle = Array.from({ length: N }, (_, i) => {
			const period = 50,
				t = i % period;
			return t < period / 2
				? (t / (period / 2)) * 2 - 1
				: ((period - t) / (period / 2)) * 2 - 1;
		});
		const noise = Array.from({ length: N }, () => Math.random() * 2 - 1);
		const dmc = Array.from({ length: N }, () => Math.random() * 2 - 1);
		const mix = square1.map(
			(v, i) => (v + square2[i] + triangle[i] + noise[i] + dmc[i]) / 5
		);

		const size = new ImGui.Vec2(0, 80);
		ImGui.PlotLines("Pulse Channel 1", square1, N, 0, "", -1, 1, size);
		ImGui.PlotLines("Pulse Channel 2", square2, N, 0, "", -1, 1, size);
		ImGui.PlotLines("Triangle Channel", triangle, N, 0, "", -1, 1, size);
		ImGui.PlotLines("Noise Channel", noise, N, 0, "", -1, 1, size);
		ImGui.PlotLines("DMC Channel", dmc, N, 0, "", -1, 1, size);
		ImGui.PlotLines("Mix", mix, N, 0, "", -1, 1, size);
	}
}
