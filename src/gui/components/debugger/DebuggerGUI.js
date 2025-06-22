import Debugger_APU from "./Debugger_APU";
import Debugger_CPU from "./Debugger_CPU";
import Debugger_External from "./Debugger_External";
import Debugger_Logs from "./Debugger_Logs";
import Debugger_Memory from "./Debugger_Memory";
import Debugger_PPU from "./Debugger_PPU";
import utils from "./utils";

const ImGui = window.ImGui;

export default class DebuggerGUI {
	constructor() {
		this._memory = new Debugger_Memory();
		this._cpu = new Debugger_CPU();
		this._ppu = new Debugger_PPU();
		this._apu = new Debugger_APU();
		this._external = new Debugger_External();
		this._logs = new Debugger_Logs();
	}

	init() {
		this._ppu.init();
	}

	draw() {
		const m = 10;
		ImGui.SetNextWindowPos(new ImGui.ImVec2(m, m), ImGui.Cond.FirstUseEver);
		const io = ImGui.GetIO();
		ImGui.SetNextWindowSize(
			new ImGui.ImVec2(io.DisplaySize.x - m * 2, io.DisplaySize.y - m * 2)
		);
		ImGui.Begin(
			"Debugger",
			null,
			ImGui.WindowFlags.NoMove |
				ImGui.WindowFlags.NoResize |
				ImGui.WindowFlags.NoCollapse
		);

		if (ImGui.BeginTabBar("Tabs")) {
			const btns = [
				{ label: "pause" },
				{ label: "run frame", color: "#b87632" },
				{ label: "run scanline", color: "#2a62b0" },
			];
			const style = ImGui.GetStyle();
			const totalW =
				btns.reduce(
					(acc, b) =>
						acc + ImGui.CalcTextSize(b.label).x + style.FramePadding.x * 2,
					0
				) +
				style.ItemSpacing.x * (btns.length - 1);
			ImGui.SameLine(ImGui.GetContentRegionAvail().x - totalW);
			btns.forEach(({ label, color }, i) => {
				if (color) {
					utils.withBgColor(color, () => ImGui.Button(label));
				} else {
					ImGui.Button(label);
				}
				if (i < btns.length - 1) ImGui.SameLine();
			});

			const tabs = [
				{ name: "Memory", pane: this._memory },
				{ name: "CPU", pane: this._cpu },
				{ name: "PPU", pane: this._ppu },
				{ name: "APU", pane: this._apu },
				{ name: "External", pane: this._external },
				{ name: "Logs", pane: this._logs },
			];
			for (let { name, pane } of tabs) {
				if (ImGui.BeginTabItem(name)) {
					ImGui.BeginChild(
						"Child" + name,
						new ImGui.ImVec2(0, 0),
						false,
						ImGui.WindowFlags.None
					);
					pane.draw();
					ImGui.EndChild();
					ImGui.EndTabItem();
				}
			}

			ImGui.EndTabBar();
		}

		ImGui.End();
	}

	destroy() {
		this._cpu.destroy();
	}
}
