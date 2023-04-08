import React, { PureComponent } from "react";
import classNames from "classnames";
import EmulatorBuilder from "../../../EmulatorBuilder";
import Book from "../../../level/Book";
import locales from "../../../locales";
import store from "../../../store";
import Tooltip from "../../components/widgets/Tooltip";
import VolumeSlider from "../../components/widgets/VolumeSlider";
import TVNoise from "../TVNoise";
import Screen from "./Screen";
import Unit from "./Unit";
import Speaker from "./runner/Speaker";
import WebWorker from "./runner/WebWorker";
import gamepad from "./runner/gamepad";
import styles from "./Emulator.module.css";

const NEW_WEB_WORKER = () =>
	new Worker(new URL("./runner/webWorkerRunner.js", import.meta.url));

// Web Workers are faster, but hard to debug. When disabled, a mock is used.
const USE_WEB_WORKER = false;
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
const SAVESTATE_KEY = "emudevz-savestate";
const COMPONENT_BORDER_RADIUS = 8;

let webWorker = null;

export default class Emulator extends PureComponent {
	render() {
		const { rom /*, error*/ } = this.props;

		const book = Book.current;

		return (
			<div
				className={styles.container}
				ref={(ref) => {
					this._container = ref;
				}}
			>
				<div
					className={classNames(
						styles.bar,
						"d-none d-lg-flex d-xl-flex d-xxl-flex"
					)}
				>
					<div className={styles.column}>
						<div className={styles.row}>
							<Unit
								icon="💻"
								name="CPU"
								completed={book.hasFinishedCPU}
								style={{ borderTopLeftRadius: COMPONENT_BORDER_RADIUS }}
							/>
							<Unit icon="🖥️" name="PPU" completed={book.hasFinishedPPU} />
							<Unit
								icon="🔊"
								name="APU"
								completed={book.hasFinishedAPU}
								style={{ borderTopRightRadius: COMPONENT_BORDER_RADIUS }}
							/>
						</div>
						<div className={styles.row}>
							<Unit
								icon="🎮"
								name={locales.get("controller")}
								completed={book.hasFinishedController}
								style={{ borderBottomLeftRadius: COMPONENT_BORDER_RADIUS }}
							/>
							<Unit
								icon="🕹️"
								name={locales.get("console")}
								completed={book.hasFinishedConsole}
							/>
							<Unit
								icon="🧠"
								name={"Mappers"}
								completed={book.hasFinishedMappers}
								style={{ borderBottomRightRadius: COMPONENT_BORDER_RADIUS }}
								customIncompleteIcon="⚠️"
								customIncompleteMessage="using_default_emulator"
							/>
						</div>
					</div>
					<div
						className={styles.row}
						ref={(ref) => {
							this._config = ref;
						}}
					>
						<span>⚡️&nbsp;</span>
						<span id="fps">00</span>
						<span>&nbsp;FPS</span>
						<span>&nbsp;|&nbsp;</span>
						<Tooltip title={locales.get("using_keyboard")} placement="top">
							<span id="keyboard">⌨️</span>
						</Tooltip>
						<Tooltip
							title={locales.get("using_gamepad")}
							placement="top"
							style={{ display: "none" }}
						>
							<span id="gamepad">🎮</span>
						</Tooltip>
						<span>&nbsp;|&nbsp;</span>
						<VolumeSlider
							volume={null}
							setVolume={(v) => {
								this._volume = v;
							}}
							defaultVolume={this._volume}
							style={{ marginLeft: 8, width: 64 }}
							className="emu-volume-slider"
						/>
					</div>
				</div>
				<div className={styles.content}>
					{!!rom ? (
						<Screen
							className={styles.box}
							ref={(screen) => {
								if (screen) this._initialize(screen);
							}}
						/>
					) : (
						<TVNoise className={styles.box} />
					)}
				</div>
			</div>
		);
	}

	sendState = () => {
		const gamepadInput = gamepad.getInput();
		const input = gamepadInput || this.keyboardInput;

		if (this._container) {
			this._container.querySelector("#keyboard").style.display = gamepadInput
				? "none"
				: "block";
			this._container.querySelector("#gamepad").style.display = gamepadInput
				? "block"
				: "none";
		}

		if (webWorker) webWorker.postMessage([...input, this.speaker.bufferSize]);
	};

	setFps = (fps) => {
		if (!this._container) return;
		const formattedFps = `${fps}`.padStart(2, "0");
		this._container.querySelector("#fps").textContent = formattedFps;
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

		if (webWorker) {
			webWorker.terminate();
			webWorker = null;
		}

		this.setFps(0);

		window.removeEventListener("keydown", this._onKeyDown);
		window.removeEventListener("keyup", this._onKeyUp);
	}

	componentWillUnmount() {
		this.stop();
	}

	_initialize(screen) {
		const { rom } = this.props;
		if (!rom) return;
		this.screen = screen;

		this.stop();
		this.stateInterval = setInterval(this.sendState, STATE_POLL_INTERVAL);
		this.speaker = new Speaker(this._volume);
		this.speaker.start();

		const bytes = new Uint8Array(rom);
		const book = Book.current;

		new EmulatorBuilder()
			.addUserCPU(book.hasFinishedCPU)
			.addUserPPU(book.hasFinishedPPU)
			.addUserAPU(book.hasFinishedAPU)
			.addUserController(book.hasFinishedController)
			.build(true)
			.then((Console) => {
				webWorker = !USE_WEB_WORKER
					? new WebWorker(
							Console,
							(data) => this.onWorkerMessage({ data }),
							this.speaker.writeSample,
							this.speaker
					  )
					: NEW_WEB_WORKER();

				webWorker.onmessage = this.onWorkerMessage;

				webWorker.postMessage(bytes);
				if (webWorker == null) return;

				webWorker.postMessage({
					id: "saveState",
					saveState: this._getSaveState(),
				});
				if (webWorker == null) return;

				this.keyboardInput = [gamepad.createInput(), gamepad.createInput()];
				window.addEventListener("keydown", this._onKeyDown);
				window.addEventListener("keyup", this._onKeyUp);
			});
	}

	_getSaveState() {
		try {
			return JSON.parse(localStorage.getItem(SAVESTATE_KEY));
		} catch (e) {
			return null;
		}
	}

	_setSaveState(saveState) {
		localStorage.setItem(SAVESTATE_KEY, JSON.stringify(saveState));
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

	get _volume() {
		return store.getState().savedata.emulatorVolume;
	}

	set _volume(value) {
		if (this.speaker) this.speaker.setVolume(value);
		store.dispatch.savedata.setEmulatorVolume(value);
	}
}
