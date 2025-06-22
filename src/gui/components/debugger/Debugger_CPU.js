import { hex } from "../../../utils";
import { NEEESSimpleCPULogger } from "../../../utils/nes";
import utils from "./utils";

const ImGui = window.ImGui;

const LOG_LIMIT = 240;

export default class Debugger_CPU {
	constructor() {
		this._logs = [];
		this._logger = new NEEESSimpleCPULogger();
		this._scanline = 0;

		const neees = window.EMULATION?.neees;
		if (!neees) return;
		neees.cpu.logger = (a, b, c, d, e) => {
			const scanline = neees?.ppu.scanline ?? 0;
			if (scanline !== this._scanline) {
				this._scanline = scanline;
				this._logger.log(a, b, c, d, e);
				this._logs.unshift(this._logger.lastLog);
				if (this._logs.length > LOG_LIMIT) this._logs.pop();
			}
		};
	}

	draw() {
		const neees = window.EMULATION?.neees;

		const registerFields = ["a", "x", "y", "sp", "pc"];
		const registers = registerFields.map((it) => `[${it.toUpperCase()}]`);
		const flags = ["N", "V", "-", "-", "D", "I", "Z", "C"];
		const disassemblyFields = [
			"$counter",
			"$commandHex",
			"$assembly",
			"$status",
		];

		const flagsSmall =
			ImGui.TableFlags.SizingStretchProp |
			ImGui.TableFlags.RowBg |
			ImGui.TableFlags.Borders;

		ImGui.Columns(2, "cpu_flag_columns", false);

		if (ImGui.BeginTable("registers", registers.length, flagsSmall)) {
			for (let h of registers) ImGui.TableSetupColumn(h);
			ImGui.TableHeadersRow();
			ImGui.TableNextRow();
			for (let i = 0; i < registers.length; i++) {
				ImGui.TableSetColumnIndex(i);
				const registerField = registerFields[i];
				const value = utils.numberOr0(neees?.cpu[registerField]?.getValue());
				ImGui.Text("$" + hex.format(value, registerField === "pc" ? 4 : 2));
			}
			ImGui.EndTable();
		}

		ImGui.NextColumn();

		if (ImGui.BeginTable("flags", flags.length, flagsSmall)) {
			for (let h of flags) ImGui.TableSetupColumn(h);
			ImGui.TableHeadersRow();
			ImGui.TableNextRow();
			for (let i = 0; i < flags.length; i++) {
				ImGui.TableSetColumnIndex(i);
				const flagField = flags[i].toLowerCase();
				const value = utils.numberOr0(
					+(neees?.cpu.flags?.[flagField] ?? false)
				);
				ImGui.Text(i === 2 ? "1" : i === 3 ? "0" : `${value}`);
			}
			ImGui.EndTable();
		}

		ImGui.Columns(1);

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
				ImGui.TableNextRow();
				for (let col = 0; col < 4; col++) {
					ImGui.TableSetColumnIndex(col);
					const field = disassemblyFields[col];
					const value = this._logs[row][field];
					ImGui.Text(value);
				}
			}
			ImGui.EndTable();
		}
	}

	destroy() {
		const neees = window.EMULATION?.neees;
		if (!neees) return;

		neees.cpu.logger = null;
	}
}
