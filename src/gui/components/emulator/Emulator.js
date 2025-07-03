import React, { Component } from "react";
import EmulatorBuilder from "../../../EmulatorBuilder";
import Level from "../../../level/Level";
import { bus } from "../../../utils";
import music from "../../sound/music";
import TVNoise from "../TVNoise";
import Screen from "./Screen";
import Emulation from "./runner/Emulation";
import gamepad from "./runner/gamepad";
import styles from "./Emulator.module.css";

export const SAVESTATE_KEY_PREFIX = "persist:emudevz:savestate-";
export const SAVESTATE_RESET_COMMAND = "reset";

const KEY_MAP = {
	" ": "BUTTON_A",
	d: "BUTTON_B",
	Backspace: "BUTTON_SELECT",
	Enter: "BUTTON_START",
	ArrowUp: "BUTTON_UP",
	ArrowDown: "BUTTON_DOWN",
	ArrowLeft: "BUTTON_LEFT",
	ArrowRight: "BUTTON_RIGHT",
};

export default class Emulator extends Component {
	render() {
		const { rom, error, crt = false, screen = null, style } = this.props;

		const innerClassName = crt ? styles.crtNoise : styles.box;

		return (
			<div className={!screen ? styles.content : ""} style={style}>
				{error ? (
					<div className={styles.message}>
						<span
							dangerouslySetInnerHTML={{
								__html: "❌ " + error,
							}}
						/>
					</div>
				) : !!rom ? (
					!screen ? (
						<Screen
							className={innerClassName}
							ref={(screen) => {
								if (screen) this._initialize(screen);
							}}
						/>
					) : (
						<div
							ref={(div) => {
								if (div) this._initialize(screen);
							}}
						/>
					)
				) : (
					!screen && <TVNoise className={innerClassName} />
				)}
			</div>
		);
	}

	get neees() {
		return this._emulation?.neees;
	}

	get speaker() {
		return this._emulation?.speaker;
	}

	get saveStateKey() {
		const { autoSaveAndRestore } = this.props;
		if (!autoSaveAndRestore) return null;
		return SAVESTATE_KEY_PREFIX + autoSaveAndRestore;
	}

	getScreenshot() {
		return this._emulation?.screen.canvas?.toDataURL();
	}

	setBuffer(frameBuffer) {
		this._emulation?.screen.setBuffer(frameBuffer);
	}

	toggleFullscreen = () => {
		this._emulation.toggleFullscreen();
	};

	stop() {
		this._stop();
	}

	componentDidMount() {
		window.addEventListener("beforeunload", this._saveProgress);
	}

	componentWillUnmount() {
		this._saveProgress();
		window.removeEventListener("beforeunload", this._saveProgress);

		this._stop();
	}

	async _initialize(screen) {
		const {
			rom,
			settings,
			volume,
			onStart,
			onFrame,
			syncToVideo = false,
		} = this.props;
		this.screen = screen;
		if (!rom) return;

		const currentLevel = Level.current;

		let Console;
		try {
			Console = settings.useHardware
				? await new EmulatorBuilder()
						.setHardware(true)
						.setUnbroken(true)
						.build()
				: await new EmulatorBuilder()
						.addUserCartridge(settings.useCartridge)
						.addUserCPU(settings.useCPU)
						.addUserPPU(settings.usePPU)
						.addUserAPU(settings.useAPU)
						.addUserController(settings.useController)
						.addUserMappers(settings.useMappers)
						.usePartialPPU(currentLevel.id.startsWith("ppu-"))
						.usePartialAPU(currentLevel.id.startsWith("apu-"))
						.setCustomPPU(settings.customPPU)
						.setCustomAPU(settings.customAPU)
						.setUnbroken(settings.unbroken)
						.build(settings.withLatestCode);
		} catch (e) {
			this._onError(e);
			return;
		}

		this._stop(false);
		if (volume > 0) music.pause();
		this.keyboardInput = gamepad.createInput();
		window.addEventListener("keydown", this._onKeyDown);
		window.addEventListener("keyup", this._onKeyUp);
		window.addEventListener("fullscreenchange", this._onFullscreenChange);

		const bytes = new Uint8Array(rom);
		const saveState =
			this.props.saveState != null
				? this.props.saveState
				: this._getSaveState();
		this._emulation = new Emulation(
			Console,
			bytes,
			screen,
			this._getInput,
			this._setFps,
			this._setError,
			this._setSaveState,
			saveState,
			volume,
			syncToVideo,
			onFrame
		);
		onStart?.(this._emulation);
		bus.emit("emulator-started");
	}

	_getInput = () => {
		const gamepadInput = gamepad.getInput();

		this.props.onInputType(gamepadInput ? "gamepad" : "keyboard");

		return gamepadInput?.[0] != null
			? [
					gamepadInput?.[0],
					gamepad.createInput() /*gamepadInput?.[1] || this.keyboardInput*/,
			  ]
			: [this.keyboardInput, gamepad.createInput()];
	};

	_setFps = (fps) => {
		this.props.onFps(fps);
	};

	_setError = (error) => {
		this.props.onError(error);
		this._stop();
	};

	_stop(resumeMusic = true) {
		if (this._emulation) {
			this._emulation.terminate();
			this._emulation = null;
		}

		this._setFps(0);

		window.removeEventListener("keydown", this._onKeyDown);
		window.removeEventListener("keyup", this._onKeyUp);
		window.removeEventListener("fullscreenchange", this._onFullscreenChange);
		this.props.onStop?.();
		bus.emit("emulator-stopped");
		if (resumeMusic) music.resume();
	}

	_onKeyDown = (e) => {
		if (!document.fullscreenElement && document.activeElement.id !== "emulator")
			return;

		const button = KEY_MAP[e.key];
		if (!button) return;

		this.keyboardInput[button] = true;
	};

	_onKeyUp = (e) => {
		if (!document.fullscreenElement && document.activeElement.id !== "emulator")
			return;

		const button = KEY_MAP[e.key];
		if (!button) return;

		this.keyboardInput[button] = false;
	};

	_onFullscreenChange = () => {
		this._clearInput();
	};

	_clearInput = () => {
		for (let key in this.keyboardInput) {
			this.keyboardInput[key] = false;
		}
	};

	_saveProgress = () => {
		if (!this.saveStateKey) return;
		if (this._resetProgressIfNeeded()) return;

		if (this.neees != null) this._setSaveState(this.neees.getSaveState());
	};

	_resetProgressIfNeeded = () => {
		if (this._getRawSaveState() === SAVESTATE_RESET_COMMAND) {
			this._setSaveState(null);
			return true;
		}
		return false;
	};

	_getSaveState() {
		if (!this.saveStateKey) return null;
		if (this._resetProgressIfNeeded()) return null;

		try {
			return JSON.parse(this._getRawSaveState());
		} catch (e) {
			return null;
		}
	}

	_getRawSaveState() {
		return localStorage.getItem(this.saveStateKey);
	}

	_setSaveState(saveState) {
		if (!this.saveStateKey) return;

		localStorage.setItem(this.saveStateKey, JSON.stringify(saveState));
	}

	_onError(e) {
		console.error(e);
		this.props.onError(e);
		this._stop();
	}
}
