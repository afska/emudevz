import Book from "../../../../level/Book";
import Level from "../../../../level/Level";

export default {
	getInput() {
		const gamepads = navigator
			.getGamepads()
			.filter((it) => it && it.mapping === "standard");

		const input = [this.createInput(), this.createInput()];

		if (gamepads.length === 0) return null;
		if (gamepads.length > 0) this._setButtons(input[0], gamepads[0]);
		if (gamepads.length > 1) this._setButtons(input[1], gamepads[1]);

		return input;
	},

	createInput() {
		const isFreeMode = Level.current.isFreeMode();

		return {
			BUTTON_A: false,
			BUTTON_B: false,
			BUTTON_SELECT: false,
			BUTTON_START: false,
			BUTTON_UP: false,
			BUTTON_DOWN: false,
			BUTTON_LEFT: false,
			BUTTON_RIGHT: false,
			...(isFreeMode
				? { BUTTON_X: false, BUTTON_Y: false, BUTTON_L: false, BUTTON_R: false }
				: {}),
		};
	},

	_setButtons(input, gamepad) {
		const isFreeMode = Level.current.isFreeMode();

		input.BUTTON_A = gamepad.buttons[1].pressed;
		input.BUTTON_B = gamepad.buttons[0].pressed;
		input.BUTTON_SELECT = gamepad.buttons[8].pressed;
		input.BUTTON_START = gamepad.buttons[9].pressed;
		input.BUTTON_UP = gamepad.buttons[12].pressed;
		input.BUTTON_DOWN = gamepad.buttons[13].pressed;
		input.BUTTON_LEFT = gamepad.buttons[14].pressed;
		input.BUTTON_RIGHT = gamepad.buttons[15].pressed;
		if (isFreeMode) {
			input.BUTTON_Y = gamepad.buttons[2].pressed;
			input.BUTTON_X = gamepad.buttons[3].pressed;
			input.BUTTON_L = gamepad.buttons[4].pressed;
			input.BUTTON_R = gamepad.buttons[5].pressed;
		}
	},
};
