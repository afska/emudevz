import { hex } from "../../../utils";
import { NEEESSimpleCPULogger } from "../../../utils/nes";
import widgets from "./widgets";

const ImGui = window.ImGui;

// Knobs
const LOG_LIMIT = 1000;

const LOGGER_TYPE = "cpu";
const REGISTER_FIELDS = ["a", "x", "y", "sp", "pc"];
const REGISTERS = REGISTER_FIELDS.map((it) => `[${it.toUpperCase()}]`);
const FLAGS = ["N", "V", "-", "-", "D", "I", "Z", "C"];
const DISASSEMBLY_FIELDS = ["$counter", "$commandHex", "$assembly", "$status"];

export default class Debugger_CPU {
	constructor() {
		this.isRunningStepByStep = false;

		this._logs = [];
		this._logger = new NEEESSimpleCPULogger();
		this._scanline = 0;
	}

	draw() {
		const neees = window.EmuDevz.emulation?.neees;

		this._setUpLoggerIfNeeded(neees);
		this._drawRegistersAndFlags(neees);
		this._drawDisassembly();
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
			neees.cpu.logger = (a, b, c, d, e) => {
				if (this._destroyed) {
					neees.cpu.logger = null;
					return;
				}

				const scanline = neees?.ppu.scanline ?? 0;
				if (this.isRunningStepByStep || scanline !== this._scanline) {
					this._scanline = scanline;
					const newLog = this._logger.log(a, b, c, d, e);
					this._logs.unshift(newLog);
					if (this._logs.length > LOG_LIMIT) this._logs.pop();
				}
			};
			neees.cpu.logger.type = LOGGER_TYPE;
		}
	}

	_drawRegistersAndFlags(neees) {
		const flagsSmall =
			ImGui.TableFlags.SizingStretchProp |
			ImGui.TableFlags.RowBg |
			ImGui.TableFlags.Borders;

		ImGui.Columns(2, "cpu_flag_columns", false);

		if (ImGui.BeginTable("registers", REGISTERS.length, flagsSmall)) {
			for (let h of REGISTERS) ImGui.TableSetupColumn(h);
			ImGui.TableHeadersRow();
			ImGui.TableNextRow();
			for (let i = 0; i < REGISTERS.length; i++) {
				ImGui.TableSetColumnIndex(i);
				const registerField = REGISTER_FIELDS[i];
				const value = widgets.numberOr0(neees?.cpu[registerField]?.getValue());
				ImGui.Text("$" + hex.format(value, registerField === "pc" ? 4 : 2));
			}
			ImGui.EndTable();
		}

		ImGui.NextColumn();

		if (ImGui.BeginTable("flags", FLAGS.length, flagsSmall)) {
			for (let h of FLAGS) ImGui.TableSetupColumn(h);
			ImGui.TableHeadersRow();
			ImGui.TableNextRow();
			for (let i = 0; i < FLAGS.length; i++) {
				ImGui.TableSetColumnIndex(i);
				const flagField = FLAGS[i].toLowerCase();
				const value = widgets.numberOr0(
					+(neees?.cpu.flags?.[flagField] ?? false)
				);
				ImGui.Text(i === 2 ? "1" : i === 3 ? "0" : `${value}`);
			}
			ImGui.EndTable();
		}

		ImGui.Columns(1);
	}

	_drawDisassembly() {
		const flagsBig =
			ImGui.TableFlags.SizingFixedFit |
			ImGui.TableFlags.RowBg |
			ImGui.TableFlags.Borders |
			ImGui.TableFlags.ScrollY |
			ImGui.TableFlags.NoHostExtendX;

		if (ImGui.BeginTable("disassembly", 4, flagsBig)) {
			ImGui.TableSetupScrollFreeze(0, 1);
			ImGui.TableSetupColumn("[PC]", ImGui.TableColumnFlags.WidthFixed);
			ImGui.TableSetupColumn(
				"Binary",
				ImGui.TableColumnFlags.WidthFixed,
				10 * 8
			);
			ImGui.TableSetupColumn(
				"Instruction",
				ImGui.TableColumnFlags.WidthFixed,
				20 * 8
			);
			ImGui.TableSetupColumn("Context", ImGui.TableColumnFlags.WidthFixed);
			ImGui.TableHeadersRow();
			for (let row = 0; row < this._logs.length; row++) {
				if (this._logs[row] == null) continue;

				ImGui.TableNextRow();
				for (let col = 0; col < 4; col++) {
					ImGui.TableSetColumnIndex(col);
					const field = DISASSEMBLY_FIELDS[col];
					const value = this._logs[row][field];
					ImGui.Text(value);
				}
			}
			ImGui.EndTable();
		}
	}
}
