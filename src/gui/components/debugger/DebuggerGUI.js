import Debugger_APU from "./Debugger_APU";
import Debugger_CPU from "./Debugger_CPU";
import Debugger_External from "./Debugger_External";
import Debugger_Logs from "./Debugger_Logs";
import Debugger_Memory from "./Debugger_Memory";
import Debugger_PPU from "./Debugger_PPU";
import widgets from "./widgets";

const ImGui = window.ImGui;

const OPTION_RUN_FRAME = "Run frame";
const OPTION_RUN_SCANLINE = "Run scanline";

export default class DebuggerGUI {
	constructor(args) {
		this.args = args;
		this.selectedTab = args.initialTab || null;

		this.memory = new Debugger_Memory(args);
		this.cpu = new Debugger_CPU(args);
		this.ppu = new Debugger_PPU(args);
		this.apu = new Debugger_APU(args);
		this.external = new Debugger_External(args);
		this.logs = new Debugger_Logs(args);
	}

	init() {
		this.ppu.init();
	}

	draw() {
		try {
			window.EmuDevz.state.isRunningDebugger = true;
			widgets.window("Debugger", {}, () => {
				if (ImGui.BeginTabBar("Tabs")) {
					this._drawRunButtons();

					const tabs = [
						{ name: "Memory", pane: this.memory },
						{ name: "CPU", pane: this.cpu },
						{ name: "PPU", pane: this.ppu },
						{ name: "APU", pane: this.apu },
						{ name: "Controllers", pane: this.external },
						{ name: "Logs", pane: this.logs },
					];
					for (let { name, pane } of tabs) {
						widgets.simpleTab(this, name, () => pane.draw());
					}

					ImGui.EndTabBar();
					this.selectedTab = null;
				}
			});
		} finally {
			window.EmuDevz.state.isRunningDebugger = false;
		}
	}

	destroy() {
		this.cpu.destroy();
		this.ppu.destroy();
		this.apu.destroy();
		this.logs.destroy();
	}

	_drawRunButtons() {
		const emulation = window.EmuDevz.emulation;

		const btns = [
			{ label: emulation?.isDebugging ? "Resume" : "Pause" },
			{ label: OPTION_RUN_FRAME, color: "#b87632" },
			{ label: OPTION_RUN_SCANLINE, color: "#2a62b0" },
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

		if (!this.args.readOnly) {
			btns.forEach(({ label, color }, i) => {
				if (color) {
					widgets.withBgColor(color, () => {
						ImGui.Button(label);
						if (ImGui.IsItemHovered()) {
							if (label === OPTION_RUN_FRAME)
								ImGui.SetTooltip(
									"Left click: Hold to run.\nRight click: Run single frame."
								);
							if (label === OPTION_RUN_SCANLINE)
								ImGui.SetTooltip(
									"Hold left: Hold to run.\nRight click: Run single scanline."
								);
						}
						const isRightClicked = ImGui.IsItemClicked(1);
						const isActive = ImGui.IsItemActive() && !ImGui.IsMouseDown(1);

						if (label === OPTION_RUN_SCANLINE)
							this.cpu.isRunningStepByStep = isActive || isRightClicked;

						if (label === OPTION_RUN_FRAME && isRightClicked) {
							if (emulation) emulation.isDebugStepFrameRequested = true;
						}
						if (label === OPTION_RUN_SCANLINE && isRightClicked) {
							if (emulation) emulation.isDebugStepScanlineRequested = true;
						}

						if (isActive) {
							if (emulation) {
								emulation.isDebugging = true;
								if (label === OPTION_RUN_FRAME)
									emulation.isDebugStepFrameRequested = true;
								else if (label === OPTION_RUN_SCANLINE)
									emulation.isDebugStepScanlineRequested = true;
							}
						}
					});
				} else {
					if (ImGui.Button(label)) {
						if (emulation) emulation.toggleDebugging();
					}
				}
				if (i < btns.length - 1) ImGui.SameLine();
			});
		}
	}
}
