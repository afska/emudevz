import utils from "./utils";

const ImGui = window.ImGui;

const ORDERED_BUTTONS = [
	"A",
	"B",
	"Select",
	"Start",
	"Up",
	"Down",
	"Left",
	"Right",
];

export default class Debugger_External {
	draw() {
		const neees = window.EMULATION?.neees;

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

		for (let c = 0; c < 2; c++) {
			if (ImGui.BeginTable("controller" + (c + 1), 1, flags)) {
				ImGui.TableSetupColumn(
					`Controller ${c + 1}`,
					ImGui.TableColumnFlags.None
				);
				ImGui.TableHeadersRow();
				ImGui.TableNextRow();
				ImGui.TableSetColumnIndex(0);
				for (let i = 0; i < buttons.length; i++) {
					let pressed = false;
					const label = buttons[i];
					const nesButtons = neees?.context.controllers[c]._buttons; // TODO: FIX
					if (nesButtons != null)
						pressed = nesButtons[ORDERED_BUTTONS.indexOf(label)];
					const hex = pressed ? "#c39f79" : "#808080";
					utils.withTextColor(hex, () => ImGui.Text(label));
					ImGui.SameLine();
				}
				ImGui.EndTable();
			}
			ImGui.NextColumn();
		}

		ImGui.Columns(1);
	}
}
