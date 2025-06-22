const ImGui = window.ImGui;

export default class Debugger_External {
	draw() {
		const buttons = [
			"Up",
			"Down",
			"Left",
			"Right",
			"A",
			"B",
			"Select",
			"Start",
		];
		const flags =
			ImGui.TableFlags.SizingStretchProp |
			ImGui.TableFlags.RowBg |
			ImGui.TableFlags.Borders;

		ImGui.Columns(2, "external_controller_columns", false);

		for (let c = 1; c <= 2; c++) {
			if (ImGui.BeginTable("controller" + c, 1, flags)) {
				ImGui.TableSetupColumn(`Controller ${c}`, ImGui.TableColumnFlags.None);
				ImGui.TableHeadersRow();
				ImGui.TableNextRow();
				ImGui.TableSetColumnIndex(0);
				for (let i = 0; i < buttons.length; i++) {
					const pressed = c === 1 ? i % 2 === 0 : i % 3 === 0;
					const col = pressed
						? new ImGui.Vec4(0xc3 / 255, 0x9f / 255, 0x79 / 255, 1)
						: new ImGui.Vec4(0.5, 0.5, 0.5, 1);
					ImGui.TextColored(col, buttons[i]);
					ImGui.SameLine();
				}
				ImGui.EndTable();
			}
			ImGui.NextColumn();
		}

		ImGui.Columns(1);
	}
}
