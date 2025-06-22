import { hex } from "../../../utils";
import utils from "./utils";

const ImGui = window.ImGui;

export default class Debugger_CPU {
	draw() {
		const neees = window.EMULATION?.neees;

		const registerFields = ["a", "x", "y", "sp", "pc"];
		const registers = registerFields.map((it) => `[${it.toUpperCase()}]`);
		const flags = ["N", "V", "-", "-", "D", "I", "Z", "C"];

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
				16 * 8
			);
			ImGui.TableSetupColumn("Context", ImGui.TableColumnFlags.WidthFixed);
			ImGui.TableHeadersRow();
			for (let row = 0; row < 32; row++) {
				ImGui.TableNextRow();
				for (let col = 0; col < 4; col++) {
					ImGui.TableSetColumnIndex(col);
					ImGui.Text(
						col === 0
							? "C000"
							: col === 1
							? "4C F5 C5"
							: col === 2
							? "JMP $C5F5"
							: "A:00 X:00 Y:00 P:24 SP:FD CYC:7"
					);
				}
			}
			ImGui.EndTable();
		}
	}
}
