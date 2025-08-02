const ImGui = window.ImGui;

const LOG_LIMIT = 1000;
const LOGGER_TYPE = "logs";

export default class Debugger_Logs {
	constructor() {
		this.isRunningStepByStep = false;

		this._logs = [];
	}

	draw() {
		const neees = window.EmuDevz.emulation?.neees;

		if (
			neees != null &&
			(neees.cpu.logger == null || neees.cpu.logger.type !== LOGGER_TYPE)
		) {
			neees.cpu.logger = (text, b, c, d, e) => {
				if (!!b || !!c || !!d || !!e) return;

				if (this._destroyed) {
					neees.logger = null;
					return;
				}

				this._logs.unshift(text);
				if (this._logs.length > LOG_LIMIT) this._logs.pop();
			};
			neees.cpu.logger.type = LOGGER_TYPE;
		}

		ImGui.AlignTextToFramePadding();
		ImGui.Text("Use `EmuDevz.log(value)` to log things here!");
		ImGui.SameLine();
		{
			const region_max_x = ImGui.GetWindowContentRegionMax().x;
			const button_w =
				ImGui.CalcTextSize("Clear").x + ImGui.GetStyle().FramePadding.x * 2;
			ImGui.SetCursorPosX(region_max_x - button_w);
			ImGui.AlignTextToFramePadding();
			if (ImGui.Button("Clear")) {
				this._logs.length = 0;
			}
		}

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
			for (let row = 0; row < this._logs.length; row++) {
				ImGui.TableNextRow();
				ImGui.TableSetColumnIndex(0);
				ImGui.Text(`${this._logs[row]}`);
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
}
