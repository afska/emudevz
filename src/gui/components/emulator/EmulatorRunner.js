import React, { PureComponent } from "react";
import classNames from "classnames";
import _ from "lodash";
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

		const isRunning = rom && !error;

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
					<div className={styles.unitGroup}>
						<div className={classNames(styles.column, styles.units)}>
							<div className={styles.row}>
								<Unit
									icon="🧠"
									name={locales.get("cpu")}
									completed={this._unlockedUnits.useCPU}
									active={this._emulatorSettings.useCPU}
									onToggle={() => this._onToggle("useCPU")}
									style={{ borderTopLeftRadius: COMPONENT_BORDER_RADIUS }}
								/>
								<Unit
									icon="🖥️"
									name={locales.get("ppu")}
									completed={this._unlockedUnits.usePPU}
									active={this._emulatorSettings.usePPU}
									onToggle={() => this._onToggle("usePPU")}
								/>
								<Unit
									icon="🔊"
									name={locales.get("apu")}
									completed={this._unlockedUnits.useAPU}
									active={this._emulatorSettings.useAPU}
									onToggle={() => this._onToggle("useAPU")}
									style={{ borderTopRightRadius: COMPONENT_BORDER_RADIUS }}
								/>
							</div>
							<div className={styles.row}>
								<Unit
									icon="💾"
									name={locales.get("cartridge")}
									completed={this._unlockedUnits.useCartridge}
									active={this._emulatorSettings.useCartridge}
									onToggle={() => this._onToggle("useCartridge")}
									style={{ borderBottomLeftRadius: COMPONENT_BORDER_RADIUS }}
								/>
								<Unit
									icon="🎮"
									name={locales.get("controller")}
									completed={this._unlockedUnits.useController}
									active={this._emulatorSettings.useController}
									onToggle={() => this._onToggle("useController")}
									customIncompleteIcon="⚠️"
									customIncompleteMessage="using_default_emulator"
								/>
								<Unit
									icon="🗜️"
									name={locales.get("mappers")}
									completed={this._unlockedUnits.useMappers}
									active={this._emulatorSettings.useMappers}
									onToggle={() => this._onToggle("useMappers")}
									style={{ borderBottomRightRadius: COMPONENT_BORDER_RADIUS }}
									customIncompleteIcon="⚠️"
									customIncompleteMessage="using_default_emulator"
								/>
							</div>
						</div>
						<Unit
							icon="🕹️"
							name={locales.get("console")}
							completed={this._unlockedUnits.useConsole}
							active={this._emulatorSettings.useConsole}
							onToggle={() => this._onToggle("useConsole")}
							className={classNames(styles.units, styles.mappersUnit)}
							style={{ borderRadius: COMPONENT_BORDER_RADIUS }}
							customIncompleteIcon="⚠️"
							customIncompleteMessage="using_default_emulator"
						/>
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
						<div style={{ opacity: isRunning ? 1 : 0 }} className={styles.row}>
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
						</div>
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
					onFrame={this._setInfo}
					onStop={this._clearInfo}
					ref={(ref) => {
						this._emulator = ref;
					}}
				/>
				<pre
					className={styles.info}
					ref={(ref) => {
						this._info = ref;
					}}
				/>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"code-changed": _.debounce(this._onCodeChanged, REFRESH_DEBOUNCE_MS),
			"unit-unlocked": this._onUnitUnlocked,
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	_setError = (e) => {
		console.error(e);

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

	_setInfo = (__, neees) => {
		const header = neees?.context?.cartridge?.header;
		const mapperId = header?.mapperId ?? "❓";
		const mapperName = neees?.context?.mapper?.constructor?.name ?? "❓";
		const mirroringId =
			neees?.ppu?.memory?.mirroringId ?? header?.mirroringId ?? "❓";
		const chr = header?.usesChrRam ? "RAM" : "ROM";
		const prgRam = header?.hasPrgRam ? "✔️" : "❌";

		this._info.innerText =
			`🗜️ Mapper: ${mapperId} (${mapperName})` +
			"\n" +
			`🚽 Mirroring: ${mirroringId}` +
			"\n" +
			`👾 CHR: ${chr}` +
			"\n" +
			`🔋 PRG RAM: ${prgRam}`;
	};

	_clearInfo = () => {
		this._info.innerText = "";
	};

	_onToggle = (setting) => {
		const currentSettings = this._emulatorSettings;
		this._emulatorSettings = {
			...currentSettings,
			[setting]: !currentSettings[setting],
		};
		if (currentSettings[setting] !== this._emulatorSettings[setting]) {
			this.forceUpdate();
			this.props.onRestart();
		}
	};

	_onCodeChanged = () => {
		if (!this.props.rom) return;

		this.props.onRestart();
	};

	_onUnitUnlocked = () => {
		this.forceUpdate();
	};

	get _emulatorSettings() {
		const settings = store.getState().savedata.emulatorSettings;
		const unlockedUnits = this._unlockedUnits;

		return {
			useCartridge: unlockedUnits.useCartridge && settings.useCartridge,
			useCPU: unlockedUnits.useCPU && settings.useCPU,
			usePPU: unlockedUnits.usePPU && settings.usePPU,
			useAPU: unlockedUnits.useAPU && settings.useAPU,
			useController: unlockedUnits.useController && settings.useController,
			useConsole: unlockedUnits.useConsole && settings.useConsole,
			useMappers: unlockedUnits.useMappers && settings.useMappers,
		};
	}

	set _emulatorSettings(value) {
		store.dispatch.savedata.setEmulatorSettings(value);
	}

	get _unlockedUnits() {
		return store.getState().savedata.unlockedUnits;
	}

	get _volume() {
		return store.getState().savedata.emulatorVolume;
	}

	set _volume(value) {
		if (this._emulator?.speaker) this._emulator?.speaker.setVolume(value);
		store.dispatch.savedata.setEmulatorVolume(value);
	}
}
