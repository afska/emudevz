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
		for (let c = 1; c <= 2; c++) {
			{
				const flags =
					ImGui.TableFlags.SizingFixedFit |
					ImGui.TableFlags.RowBg |
					ImGui.TableFlags.Borders |
					ImGui.TableFlags.NoHostExtendX;
				if (ImGui.BeginTable("controller" + c, 1, flags)) {
					ImGui.TableSetupColumn(
						`Controller ${c}`,
						ImGui.TableColumnFlags.WidthFixed
					);
					ImGui.TableHeadersRow();
					ImGui.TableNextRow();
					ImGui.TableSetColumnIndex(0);
					for (let i = 0; i < buttons.length; i++) {
						const pressed = c === 1 ? i % 2 === 0 : i % 3 === 0; // mock
						const col = pressed
							? new ImGui.Vec4(0xc3 / 255, 0x9f / 255, 0x79 / 255, 1) // #c39f79
							: new ImGui.Vec4(0.5, 0.5, 0.5, 1); // gray
						ImGui.TextColored(col, buttons[i]);
						ImGui.SameLine();
					}
					ImGui.EndTable();
				}
			}
			ImGui.SameLine();
		}
	}
}
