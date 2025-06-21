const ImGui = window.ImGui;

export default class Debugger_CPU {
	draw() {
		// compute widths of table1 and table2 so we can center them with a gap
		const style = ImGui.GetStyle();
		const headers1 = ["[A]", "[X]", "[Y]", "[SP]", "[PC]"];
		const headers2 = ["N", "V", "-", "-", "D", "I", "Z", "C"];
		let table1W = 0,
			table2W = 0;

		for (let h of headers1)
			table1W += ImGui.CalcTextSize(h).x + style.CellPadding.x * 2;
		table1W +=
			style.ItemInnerSpacing.x * (headers1.length - 1) +
			style.FrameBorderSize * 2;
		for (let h of headers2)
			table2W += ImGui.CalcTextSize(h).x + style.CellPadding.x * 2;
		table2W +=
			style.ItemInnerSpacing.x * (headers2.length - 1) +
			style.FrameBorderSize * 2;

		const availW = ImGui.GetContentRegionAvail().x;
		const gap = style.ItemSpacing.x;
		const offset = (availW - table1W - table2W - gap) * 0.5;
		ImGui.SetCursorPosX(ImGui.GetCursorPosX() + offset);

		{
			const flags =
				ImGui.TableFlags.SizingFixedFit |
				ImGui.TableFlags.RowBg |
				ImGui.TableFlags.Borders |
				ImGui.TableFlags.NoHostExtendX;
			if (ImGui.BeginTable("table1", headers1.length, flags)) {
				for (let h of headers1) {
					ImGui.TableSetupColumn(h, ImGui.TableColumnFlags.WidthFixed);
				}
				ImGui.TableHeadersRow();
				ImGui.TableNextRow();
				for (let i = 0; i < headers1.length; i++) {
					ImGui.TableSetColumnIndex(i);
					ImGui.Text(i === 4 ? "$8000" : "$00");
				}
				ImGui.EndTable();
			}
		}

		ImGui.SameLine(undefined, gap);

		{
			const flags =
				ImGui.TableFlags.SizingFixedFit |
				ImGui.TableFlags.RowBg |
				ImGui.TableFlags.Borders |
				ImGui.TableFlags.NoHostExtendX;
			if (ImGui.BeginTable("table2", headers2.length, flags)) {
				for (let h of headers2) {
					ImGui.TableSetupColumn(h, ImGui.TableColumnFlags.WidthFixed);
				}
				ImGui.TableHeadersRow();
				ImGui.TableNextRow();
				for (let i = 0; i < headers2.length; i++) {
					ImGui.TableSetColumnIndex(i);
					ImGui.Text(i === 3 ? "1" : "0");
				}
				ImGui.EndTable();
			}
		}

		{
			const flags =
				ImGui.TableFlags.SizingFixedFit |
				ImGui.TableFlags.RowBg |
				ImGui.TableFlags.Borders |
				ImGui.TableFlags.ScrollY |
				ImGui.TableFlags.NoHostExtendX;
			if (ImGui.BeginTable("table3", 4, flags)) {
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
}
