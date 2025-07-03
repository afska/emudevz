import Debugger_APU from "./Debugger_APU";
import Debugger_CPU from "./Debugger_CPU";
import Debugger_External from "./Debugger_External";
import Debugger_Logs from "./Debugger_Logs";
import Debugger_Memory from "./Debugger_Memory";
import Debugger_PPU from "./Debugger_PPU";
import utils from "./utils";

const ImGui = window.ImGui;

export default class DebuggerGUI {
	constructor(args) {
		this.selectedTab = args.initialTab || null; // only works when `args.readOnly`

		this.memory = new Debugger_Memory(args);
		this.cpu = new Debugger_CPU(args);
		this.ppu = new Debugger_PPU(args);
		this.apu = new Debugger_APU(args);
		this.external = new Debugger_External(args);
		this.logs = new Debugger_Logs(args);

		this._args = args;
	}

	init() {
		this.ppu.init();
	}

	draw() {
		const emulation = window.EMULATION;

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

		const runFrame = "Run frame";
		const runScanline = "Run scanline";
		if (ImGui.BeginTabBar("Tabs")) {
			const btns = [
				{ label: emulation?.isDebugging ? "Resume" : "Pause" },
				{ label: runFrame, color: "#b87632" },
				{ label: runScanline, color: "#2a62b0" },
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

			if (!this._args.readOnly) {
				btns.forEach(({ label, color }, i) => {
					if (color) {
						utils.withBgColor(color, () => {
							ImGui.Button(label);
							const isActive = ImGui.IsItemActive();

							if (label === runScanline)
								this.cpu.isRunningStepByStep = isActive;

							if (isActive) {
								if (emulation) {
									emulation.isDebugging = true;
									if (label === runFrame) {
										emulation.isDebugStepFrameRequested = true;
									} else if (label === runScanline) {
										emulation.isDebugStepScanlineRequested = true;
									}
								}
							}
						});
					} else {
						if (ImGui.Button(label)) {
							if (emulation) emulation.isDebugging = !emulation.isDebugging;
						}
					}
					if (i < btns.length - 1) ImGui.SameLine();
				});
			}

			const tabs = [
				{ name: "Memory", pane: this.memory },
				{ name: "CPU", pane: this.cpu },
				{ name: "PPU", pane: this.ppu },
				{ name: "APU", pane: this.apu },
				{ name: "External", pane: this.external },
				{ name: "Logs", pane: this.logs },
			];
			for (let { name, pane } of tabs) {
				utils.simpleTab(
					name,
					() => pane.draw(),
					this._args.readOnly ? name === this.selectedTab : null
				);
			}

			ImGui.EndTabBar();
		}

		ImGui.End();
	}

	destroy() {
		this.cpu.destroy();
		this.apu.destroy();
	}
}
