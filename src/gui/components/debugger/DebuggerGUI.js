import Debugger_APU from "./Debugger_APU";
import Debugger_CPU from "./Debugger_CPU";
import Debugger_External from "./Debugger_External";
import Debugger_Logs from "./Debugger_Logs";
import Debugger_Memory from "./Debugger_Memory";
import Debugger_PPU from "./Debugger_PPU";

const ImGui = window.ImGui;
const ImGui_Impl = window.ImGui_Impl;

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
		const margin = 10;
		ImGui.SetNextWindowPos(
			new ImGui.ImVec2(margin, margin),
			ImGui.Cond.FirstUseEver
		);
		const io = ImGui.GetIO();
		ImGui.SetNextWindowSize(
			new ImGui.ImVec2(
				io.DisplaySize.x - margin * 2,
				io.DisplaySize.y - margin * 2
			)
		);

		ImGui.Begin(
			"Debugger",
			null,
			ImGui.WindowFlags.NoMove |
				ImGui.WindowFlags.NoResize |
				ImGui.WindowFlags.NoCollapse
		);

		if (ImGui.BeginTabBar("Tabs")) {
			if (ImGui.BeginTabItem("Memory")) {
				this._memory.draw();
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("CPU")) {
				this._cpu.draw();
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("PPU")) {
				this._ppu.draw();
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("APU")) {
				this._apu.draw();
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("External")) {
				this._external.draw();
				ImGui.EndTabItem();
			}
			if (ImGui.BeginTabItem("Logs")) {
				this._logs.draw();
				ImGui.EndTabItem();
			}
		}

		ImGui.End();
	}
}
