import widgets from "./widgets";

const ImGui = window.ImGui;

// Knobs
const LOG_LIMIT = 1000;

const LOGGER_TYPE = "logs";

export default class Debugger_Logs {
	constructor() {
		this.isRunningStepByStep = false;

		this._logs = [];
	}

	draw() {
		const neees = window.EmuDevz.emulation?.neees;

		this._setUpLoggerIfNeeded(neees);

		ImGui.AlignTextToFramePadding();
		ImGui.Text("Use `EmuDevz.log(value)` to log things here!");
		ImGui.SameLine();
		widgets.rightAlignedButton("Clear", () => {
			this._logs.length = 0;
		});

		const flagsBig =
			ImGui.TableFlags.SizingFixedFit |
			ImGui.TableFlags.RowBg |
			ImGui.TableFlags.Borders |
			ImGui.TableFlags.ScrollY |
			ImGui.TableFlags.NoHostExtendX;

		if (ImGui.BeginTable("logs", 1, flagsBig)) {
			ImGui.TableSetupScrollFreeze(0, 1);
			ImGui.TableSetupColumn("Log");
			ImGui.TableHeadersRow();
			const count = this._logs.length;
			const clipper = new ImGui.ListClipper();
			clipper.Begin(count);
			while (clipper.Step()) {
				for (let row = clipper.DisplayStart; row < clipper.DisplayEnd; row++) {
					const revIndex = count - 1 - row;
					ImGui.TableNextRow();
					ImGui.TableSetColumnIndex(0);
					ImGui.Text(`${this._logs[revIndex]}`);
				}
			}
			ImGui.EndTable();
		}
	}

	destroy() {
		const neees = window.EmuDevz.emulation?.neees;
		if (!neees) return;

		if (neees.cpu.logger?.type === LOGGER_TYPE) neees.cpu.logger = null;
		this._destroyed = true;
	}

	_setUpLoggerIfNeeded(neees) {
		if (
			neees != null &&
			(neees.cpu.logger == null || neees.cpu.logger.type !== LOGGER_TYPE)
		) {
			neees.cpu.logger = (text, b, c, d, e) => {
				if (!!b || !!c || !!d || !!e) return;

				if (this._destroyed) {
					neees.cpu.logger = null;
					return;
				}

				this._logs.push(text);
				if (this._logs.length > LOG_LIMIT) this._logs.shift();
			};
			neees.cpu.logger.type = LOGGER_TYPE;
		}
	}
}
