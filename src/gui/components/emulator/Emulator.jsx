import React, { Component } from "react";
import EmulatorBuilder from "../../../EmulatorBuilder";
import filesystem, { Drive } from "../../../filesystem";
import Book from "../../../level/Book";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import { toast } from "../../../utils";
import { bus } from "../../../utils";
import { getActiveScreenSize } from "../../screen";
import music from "../../sound/music";
import TVNoise from "../TVNoise";
import Screen from "./Screen";
import Emulation from "./runner/Emulation";
import gamepad from "./runner/gamepad";
import styles from "./Emulator.module.css";

export const SAVESTATE_KEY_PREFIX = "persist:emudevz:savestate-";
export const SAVESTATE_RESET_COMMAND = "reset";

const mapTypeToInput = (inputType, keyboardInput, gamepadInputs) => {
	switch (inputType) {
		case "keyboard":
			return keyboardInput;
		case "gamepad1":
			return gamepadInputs?.[0] || gamepad.createInput();
		case "gamepad2":
			return gamepadInputs?.[1] || gamepad.createInput();
		default:
			return gamepad.createInput();
	}
};

export default class Emulator extends Component {
	render() {
		const {
			rom,
			error,
			name = null,
			crt = false,
			screen = null,
			style,
		} = this.props;

		const innerClassName = crt ? styles.crtNoise : styles.box;
		const { width: screenW, height: screenH } = getActiveScreenSize();
		const dynamicStyle = { aspectRatio: `${screenW} / ${screenH}` };

		return (
			<div
				className={!screen ? styles.content : ""}
				style={{ ...dynamicStyle, ...style }}
			>
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

	async reloadCode(keepState = false) {
		if (!this._emulation) return;

		this._saveSaveFile();
		const saveFileBytes = this._loadSaveFile();

		const saveState = keepState ? this._emulation.neees.getSaveState() : null;
		const Console = await this._buildConsole();
		if (Console == null) return;

		this._emulation.replace(Console, saveFileBytes, saveState);
	}

	async _initialize(screen) {
		const {
			rom,
			volume,
			onStart,
			onFrame,
			syncToVideo = false,
			forceMusicPause = false,
		} = this.props;
		this.screen = screen;
		if (!rom) return;

		const Console = await this._buildConsole();
		if (Console == null) return;

		this._stop(false);
		if (volume > 0 || forceMusicPause) music.pause();
		this.keyboardInputs = {
			1: gamepad.createInput(),
			2: gamepad.createInput(),
		};
		window.addEventListener("keydown", this._onKeyDown);
		window.addEventListener("keyup", this._onKeyUp);
		window.addEventListener("fullscreenchange", this._onFullscreenChange);

		const bytes = new Uint8Array(rom);
		const saveState =
			this.props.saveState != null
				? this.props.saveState
				: this._getSaveState();

		const saveFileBytes = this._loadSaveFile();

		const savedata = store.getState().savedata;
		this._emulation = new Emulation(
			Console,
			bytes,
			saveFileBytes,
			screen,
			this._getInput,
			this._setFps,
			this._setError,
			this._setSaveState,
			onFrame,
			saveState,
			volume,
			syncToVideo || savedata.emulatorSettings.syncToVideo,
			savedata.emulatorSettings.audioBufferSize
		);

		onStart?.(this._emulation);
		bus.emit("emulator-started");
	}

	async _buildConsole() {
		try {
			const { settings } = this.props;
			const currentLevel = Level.current;

			const isFreeMode = currentLevel.id === Book.FREE_MODE_LEVEL;

			return settings.useHardware
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
						.usePartialPPU(currentLevel.usesPartialPPU)
						.usePartialAPU(currentLevel.usesPartialAPU)
						.setCustomPPU(settings.customPPU)
						.setCustomAPU(settings.customAPU)
						.setUnbroken(settings.unbroken)
						.useCustomEmulator(isFreeMode)
						.build(settings.withLatestCode);
		} catch (e) {
			this._onError(e);
			return null;
		}
	}

	_getInput = () => {
		if (this.props.noInput)
			return [gamepad.createInput(), gamepad.createInput()];

		const inputTypes = store.getState().savedata.inputTypes;
		const gamepadInputs = gamepad.getInput();

		const player1 = mapTypeToInput(
			inputTypes[1],
			this.keyboardInputs[1],
			gamepadInputs
		);
		const player2 = mapTypeToInput(
			inputTypes[2],
			this.keyboardInputs[2],
			gamepadInputs
		);

		return [player1, player2];
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
			this._saveSaveFile();
			this._emulation.terminate();
			this._emulation = null;
		}

		this._setFps(0);

		window.removeEventListener("keydown", this._onKeyDown);
		window.removeEventListener("keyup", this._onKeyUp);
		window.removeEventListener("fullscreenchange", this._onFullscreenChange);
		this.props.onStop?.();
		bus.emit("emulator-stopped");
		Level.current?.closeDebugger();
		if (resumeMusic) music.resume();
	}

	_getButton = (player, key) => {
		const selectedKey = key.toUpperCase();
		const mappings = store.getState().savedata.keyboardMappings[player];
		let selectedButton = null;

		for (let button in mappings) {
			if (mappings[button] === selectedKey) {
				if (selectedButton == null) selectedButton = button;
				else return null;
			}
		}

		return selectedButton;
	};

	_onKeyDown = (e) => {
		if (!document.fullscreenElement && document.activeElement.id !== "emulator")
			return;

		const inputTypes = store.getState().savedata.inputTypes;

		for (let player = 1; player <= 2; player++) {
			if (inputTypes[player] !== "keyboard") continue;

			const button = this._getButton(player, e.key);
			if (button) this.keyboardInputs[player][button] = true;
		}
	};

	_onKeyUp = (e) => {
		if (!document.fullscreenElement && document.activeElement.id !== "emulator")
			return;

		const inputTypes = store.getState().savedata.inputTypes;

		for (let player = 1; player <= 2; player++) {
			if (inputTypes[player] !== "keyboard") continue;

			const button = this._getButton(player, e.key);
			if (button) this.keyboardInputs[player][button] = false;
		}
	};

	_onFullscreenChange = () => {
		this._clearInput();
	};

	_clearInput = () => {
		if (!this.keyboardInputs) return;

		for (let player = 1; player <= 2; player++) {
			for (let key in this.keyboardInputs[player]) {
				this.keyboardInputs[player][key] = false;
			}
		}
	};

	_saveProgress = () => {
		this._saveSaveFile();

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

	_loadSaveFile() {
		const { name } = this.props;
		if (name == null) return null;

		this.name = name; // (cache game name)

		const saveFilePath = `${Drive.SAVE_DIR}/${name}.sav`;
		try {
			if (filesystem.exists(saveFilePath)) {
				const raw = filesystem.read(saveFilePath);
				const bytes = JSON.parse(raw);
				return bytes;
			}
		} catch (e) {
			toast.error(locales.get("save_file_cannot_be_restored"));
			console.error("💥 Corrupted save", e);
			return null;
		}
	}

	_saveSaveFile() {
		const { name } = this; // (use cached game name)
		if (name == null) return;
		if (!this._emulation) return;

		try {
			const neees = this._emulation.neees;
			const saveFileBytes = neees?.getSaveFile?.();
			if (saveFileBytes != null) {
				const saveFilePath = `${Drive.SAVE_DIR}/${name}.sav`;
				filesystem.write(saveFilePath, JSON.stringify(saveFileBytes));
			}
		} catch (e) {
			console.error("💥 Error saving", e);
			toast.error(locales.get("the_operation_failed"));
		}
	}

	_onError(e) {
		console.error(e);
		this.props.onError(e);
		this._stop();
	}
}
