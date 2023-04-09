import React, { PureComponent } from "react";
import classNames from "classnames";
import _ from "lodash";
import Book from "../../../level/Book";
import locales from "../../../locales";
import store from "../../../store";
import testContext from "../../../terminal/commands/test/context";
import { bus } from "../../../utils";
import Tooltip from "../../components/widgets/Tooltip";
import VolumeSlider from "../../components/widgets/VolumeSlider";
import Emulator from "./Emulator";
import Unit from "./Unit";
import styles from "./EmulatorRunner.module.css";

const COMPONENT_BORDER_RADIUS = 8;
const REFRESH_DEBOUNCE_MS = 500;

export default class EmulatorRunner extends PureComponent {
	render() {
		const { rom, error } = this.props;

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
					<div className={classNames(styles.column, styles.units)}>
						<div className={styles.row}>
							<Unit
								icon="💻"
								name="CPU"
								completed={book.hasFinishedCPU}
								active={this._emulatorSettings.useCPU}
								onToggle={() => this._onToggle("useCPU")}
								style={{ borderTopLeftRadius: COMPONENT_BORDER_RADIUS }}
							/>
							<Unit
								icon="🖥️"
								name="PPU"
								completed={book.hasFinishedPPU}
								active={this._emulatorSettings.usePPU}
								onToggle={() => this._onToggle("usePPU")}
							/>
							<Unit
								icon="🔊"
								name="APU"
								completed={book.hasFinishedAPU}
								active={this._emulatorSettings.useAPU}
								onToggle={() => this._onToggle("useAPU")}
								style={{ borderTopRightRadius: COMPONENT_BORDER_RADIUS }}
							/>
						</div>
						<div className={styles.row}>
							<Unit
								icon="🎮"
								name={locales.get("controller")}
								completed={book.hasFinishedController}
								active={this._emulatorSettings.useController}
								onToggle={() => this._onToggle("useController")}
								style={{ borderBottomLeftRadius: COMPONENT_BORDER_RADIUS }}
							/>
							<Unit
								icon="🕹️"
								name={locales.get("console")}
								completed={book.hasFinishedConsole}
								active={this._emulatorSettings.useController}
								onToggle={() => this._onToggle("useController")}
							/>
							<Unit
								icon="🧠"
								name={"Mappers"}
								completed={book.hasFinishedMappers}
								active={this._emulatorSettings.useMappers}
								onToggle={() => this._onToggle("useMappers")}
								style={{ borderBottomRightRadius: COMPONENT_BORDER_RADIUS }}
								customIncompleteIcon="⚠️"
								customIncompleteMessage="using_default_emulator"
							/>
						</div>
					</div>
					<div
						className={classNames(
							styles.dragMessage,
							"d-none d-xl-flex d-xxl-flex"
						)}
					>
						📦 {locales.get("drag_and_drop_here")}
					</div>
					<div className={styles.row}>
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
				<Emulator
					rom={rom}
					error={error}
					settings={this._emulatorSettings}
					volume={this._volume}
					onError={this._setError}
					onInputType={this._setInputType}
					onFps={this._setFps}
					ref={(ref) => {
						this._emulator = ref;
					}}
				/>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"code-changed": _.debounce(this._onCodeChanged, REFRESH_DEBOUNCE_MS),
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	_setError = (e) => {
		const stack = testContext.javascript.buildStack(e);
		if (stack?.location) {
			const { filePath, lineNumber } = stack.location;

			store.dispatch.savedata.openFile(filePath);
			if (_.isFinite(lineNumber))
				bus.emit("highlight", { line: lineNumber - 1 });
		}

		const error = testContext.javascript.buildHTMLError(e);
		this.props.onError(error);
	};

	_setInputType = (inputType) => {
		if (!this._container) return;
		this._container.querySelector("#keyboard").style.display =
			inputType === "keyboard" ? "block" : "none";
		this._container.querySelector("#gamepad").style.display =
			inputType === "gamepad" ? "block" : "none";
	};

	_setFps = (fps) => {
		if (!this._container) return;
		const formattedFps = `${fps}`.padStart(2, "0");
		this._container.querySelector("#fps").textContent = formattedFps;
	};

	_onToggle = (setting) => {
		const currentSettings = this._emulatorSettings;
		this._emulatorSettings = {
			...currentSettings,
			[setting]: !currentSettings[setting],
		};
		if (currentSettings[setting] !== this._emulatorSettings[setting])
			this.forceUpdate();
	};

	_onCodeChanged = () => {
		if (!this.props.rom) return;

		this.props.onRestart();
	};

	get _emulatorSettings() {
		const book = Book.current;
		const settings = store.getState().savedata.emulatorSettings;

		return {
			useCartridge: book.hasFinishedCartridge && settings.useCartridge,
			useCPU: book.hasFinishedCPU && settings.useCPU,
			usePPU: book.hasFinishedPPU && settings.usePPU,
			useAPU: book.hasFinishedAPU && settings.useAPU,
			useController: book.hasFinishedController && settings.useController,
			useConsole: book.hasFinishedConsole && settings.useConsole,
			useMappers: book.hasFinishedMappers && settings.useMappers,
		};
	}

	set _emulatorSettings(value) {
		store.dispatch.savedata.setEmulatorSettings(value);
	}

	get _volume() {
		return store.getState().savedata.emulatorVolume;
	}

	set _volume(value) {
		if (this._emulator?.speaker) this._emulator?.speaker.setVolume(value);
		store.dispatch.savedata.setEmulatorVolume(value);
	}
}
