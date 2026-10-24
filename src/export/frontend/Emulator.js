import Emulation from "./Emulation.js";
import gamepad from "./gamepad.js";
import Screen from "./video/Screen.js";

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const SAVESTATE_KEY = "fixedneees-savestate";
const KEY_MAP = {
	" ": "BUTTON_A",
	d: "BUTTON_B",
	backspace: "BUTTON_SELECT",
	enter: "BUTTON_START",
	arrowup: "BUTTON_UP",
	arrowdown: "BUTTON_DOWN",
	arrowleft: "BUTTON_LEFT",
	arrowright: "BUTTON_RIGHT",
	o: "$loadState",
	p: "$saveState",
};

export default class Emulator {
	constructor(onError) {
		this.onError = onError;

		this.canvas = document.createElement("canvas");
		this.canvas.className = "screen";
		this.canvas.width = SCREEN_WIDTH;
		this.canvas.height = SCREEN_HEIGHT;
	}

	initialize(rom) {
		const screen = new Screen(this.canvas);

		this.keyboardInput = gamepad.createInput();
		window.addEventListener("keydown", this._onKeyDown);
		window.addEventListener("keyup", this._onKeyUp);
		window.addEventListener("blur", this._onBlur);

		const bytes = new Uint8Array(rom);
		const saveState = this._getSaveState();

		try {
			this.emulation = new Emulation(
				bytes,
				screen,
				this._getInput,
				this._setFps,
				this._setError,
				this._setSaveState,
				saveState
			);
			this.emulation.start();
		} catch (err) {
			this._setError(err);
		}
	}

	_getInput = () => {
		const gamepadInput = gamepad.getInput();
		return gamepadInput?.[0] != null
			? [gamepadInput[0], gamepadInput[1] || this.keyboardInput]
			: [this.keyboardInput, gamepad.createInput()];
	};

	_setFps = (fps) => {
		document.querySelector("#fps").textContent = `(fps: ${fps})`;
	};

	_setError = (err) => {
		this.stop();
		this.onError(err);
	};

	stop() {
		if (this.emulation) {
			this.emulation.terminate();
			this.emulation = null;
		}

		this._setFps(0);

		window.removeEventListener("keydown", this._onKeyDown);
		window.removeEventListener("keyup", this._onKeyUp);
		window.removeEventListener("blur", this._onBlur);
	}

	_onKeyDown = (e) => {
		this.emulation?.speaker.resume()?.catch(this._setError);

		const button = KEY_MAP[e.key?.toLowerCase()];
		if (!button) return;

		this.keyboardInput[button] = true;
	};

	_onKeyUp = (e) => {
		const button = KEY_MAP[e.key?.toLowerCase()];
		if (!button) return;

		this.keyboardInput[button] = false;
	};

	_onBlur = () => {
		this.keyboardInput = gamepad.createInput();
	};

	_getSaveState() {
		try {
			return JSON.parse(localStorage.getItem(SAVESTATE_KEY));
		} catch (err) {
			return null;
		}
	}

	_setSaveState(saveState) {
		localStorage.setItem(SAVESTATE_KEY, JSON.stringify(saveState));
	}
}
