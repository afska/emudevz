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
		const bits = [Array(8).fill(false), Array(8).fill(false)];

		if (neees != null) {
			const [ctrl1, ctrl2] = neees.context.controllers;

			// backup strobe and cursors
			const prevStrobe = ctrl1.strobe;
			const prevCursor1 = ctrl1.cursor;
			const prevCursor2 = ctrl2.cursor;

			// pulse strobe on ctrl1
			ctrl1.onWrite(1);
			ctrl1.onWrite(0);

			// read 8 bits from each
			for (let i = 0; i < 8; i++) {
				bits[0][i] = !!ctrl1.onRead();
				bits[1][i] = !!ctrl2.onRead();
			}

			// restore strobe and cursors
			ctrl1.strobe = prevStrobe;
			ctrl1.cursor = prevCursor1;
			ctrl2.cursor = prevCursor2;
		}

		ImGui.Columns(2, "external_controller_columns", false);

		for (let c = 0; c < 2; c++) {
			utils.simpleTable("controller" + (c + 1), `Controller ${c + 1}`, () => {
				for (let i = 0; i < buttons.length; i++) {
					const label = buttons[i];
					const position = ORDERED_BUTTONS.indexOf(label);
					const pressed = bits[c][position];
					const color = pressed ? "#c39f79" : "#808080";
					utils.withTextColor(color, () => ImGui.Text(label));
					ImGui.SameLine();
				}
			});
			ImGui.NextColumn();
		}

		ImGui.Columns(1);
	}
}
