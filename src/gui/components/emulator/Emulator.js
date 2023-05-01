import React, { Component } from "react";
import NES from "nes-emu";
import EmulatorBuilder from "../../../EmulatorBuilder";
import TVNoise from "../TVNoise";
import CRTScreen from "./CRTScreen";
import Screen from "./Screen";
import EmuWebWorker from "./runner/EmuWebWorker";
import Speaker from "./runner/Speaker";
import gamepad from "./runner/gamepad";
import styles from "./Emulator.module.css";

const SAVESTATE_KEY_PREFIX = "persist:emudevz:savestate-";

const NEW_WEB_WORKER = () =>
	new Worker(new URL("./runner/emuWebWorkerRunner.js", import.meta.url));

const USE_WEB_WORKER = false; // DISABLED
const KEY_MAP = {
	" ": "BUTTON_A",
	d: "BUTTON_B",
	Delete: "BUTTON_SELECT",
	Enter: "BUTTON_START",
	ArrowUp: "BUTTON_UP",
	ArrowDown: "BUTTON_DOWN",
	ArrowLeft: "BUTTON_LEFT",
	ArrowRight: "BUTTON_RIGHT",
};

const STATE_POLL_INTERVAL = 10;

let emuWebWorker = null;

export default class Emulator extends Component {
	render() {
		const { rom, error, crt = false } = this.props;

		const ScreenComponent = crt ? CRTScreen : Screen;
		const innerClassName = crt ? styles.crtNoise : styles.box;

		return (
			<div className={styles.content}>
				{error ? (
					<div className={styles.message}>
						<span
							dangerouslySetInnerHTML={{
								__html: "❌ " + error,
							}}
						/>
					</div>
				) : !!rom ? (
					<ScreenComponent
						className={innerClassName}
						ref={(screen) => {
							if (screen) this._initialize(screen);
						}}
					/>
				) : (
					<TVNoise className={innerClassName} />
				)}
			</div>
		);
	}

	get neees() {
		return emuWebWorker?.nes;
	}

	get saveStateKey() {
		const { autoSaveAndRestore } = this.props;
		if (!autoSaveAndRestore) return null;
		return SAVESTATE_KEY_PREFIX + autoSaveAndRestore;
	}

	sendState = () => {
		const gamepadInput = gamepad.getInput();
		const input = gamepadInput || this.keyboardInput;

		this.props.onInputType(gamepadInput ? "gamepad" : "keyboard");

		if (emuWebWorker)
			emuWebWorker.postMessage([...input, this.speaker.bufferSize]);
	};

	setFps = (fps) => {
		this.props.onFps(fps);
	};

	onWorkerMessage = ({ data }) => {
		if (data instanceof Uint32Array) {
			// frame data
			this.screen.setBuffer(data);
		} else if (Array.isArray(data)) {
			// audio samples
			this.speaker.writeSamples(data);
		} else if (data?.id === "fps") {
			// fps report
			this.setFps(data.fps);
		} else if (data?.id === "saveState") {
			// save state
			this._setSaveState(data.saveState);
		} else if (data?.id === "error") {
			// error
			this._onError(data.error);
		}
	};

	stop() {
		clearInterval(this.stateInterval);
		this.stateInterval = null;

		if (this.speaker) this.speaker.stop();
		this.speaker = null;

		if (emuWebWorker) {
			emuWebWorker.terminate();
			emuWebWorker = null;
		}

		this.setFps(0);

		window.removeEventListener("keydown", this._onKeyDown);
		window.removeEventListener("keyup", this._onKeyUp);
	}

	shouldComponentUpdate() {
		this.stop();
		return true;
	}

	componentDidMount() {
		window.addEventListener("beforeunload", this._saveProgress);
	}

	componentWillUnmount() {
		this._saveProgress();
		window.removeEventListener("beforeunload", this._saveProgress);

		this.stop();
	}

	_saveProgress = () => {
		if (this.neees != null) this._setSaveState(this.neees.getSaveState());
	};

	async _initialize(screen) {
		const { rom, settings, volume } = this.props;
		this.screen = screen;
		if (!rom) return;

		let Console;
		try {
			Console = settings.useHardware
				? NES
				: await new EmulatorBuilder()
						.addUserCartridge(settings.useCartridge)
						.addUserCPU(settings.useCPU)
						.addUserPPU(settings.usePPU)
						.addUserAPU(settings.useAPU)
						.addUserController(settings.useController)
						.build(true);
		} catch (e) {
			this._onError(e);
			return;
		}

		this.stop();
		this.stateInterval = setInterval(this.sendState, STATE_POLL_INTERVAL);
		this.speaker = new Speaker(volume);
		this.speaker.start();

		const bytes = new Uint8Array(rom);

		emuWebWorker = !USE_WEB_WORKER
			? new EmuWebWorker(
					Console,
					(data) => this.onWorkerMessage({ data }),
					this.speaker.writeSample,
					this.speaker
			  )
			: NEW_WEB_WORKER();

		emuWebWorker.onmessage = this.onWorkerMessage;

		emuWebWorker.postMessage(bytes);
		if (emuWebWorker == null) return;

		const saveState = this._getSaveState();
		emuWebWorker.postMessage({
			id: "saveState",
			saveState,
		});
		if (emuWebWorker == null) return;
		if (saveState != null) this.neees.setSaveState(saveState);

		this.keyboardInput = [gamepad.createInput(), gamepad.createInput()];
		window.addEventListener("keydown", this._onKeyDown);
		window.addEventListener("keyup", this._onKeyUp);
	}

	_getSaveState() {
		if (!this.saveStateKey) return null;

		try {
			return JSON.parse(localStorage.getItem(this.saveStateKey));
		} catch (e) {
			return null;
		}
	}

	_setSaveState(saveState) {
		if (!this.saveStateKey) return;

		localStorage.setItem(this.saveStateKey, JSON.stringify(saveState));
	}

	_onError(e) {
		console.error(e);
		this.props.onError(e);
		this.stop();
	}

	_onKeyDown = (e) => {
		if (document.activeElement.id !== "emulator") return;

		const button = KEY_MAP[e.key];
		if (!button) return;

		this.keyboardInput[0][button] = true;
	};

	_onKeyUp = (e) => {
		if (document.activeElement.id !== "emulator") return;

		const button = KEY_MAP[e.key];
		if (!button) return;

		this.keyboardInput[0][button] = false;
	};
}
