import React, { PureComponent } from "react";
import { FaBug, FaExpand, FaStop, FaSync } from "react-icons/fa";
import classNames from "classnames";
import _ from "lodash";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import testContext from "../../../terminal/commands/test/context";
import { bus, filepicker } from "../../../utils";
import IconButton from "../widgets/IconButton";
import Tooltip from "../widgets/Tooltip";
import VolumeSlider from "../widgets/VolumeSlider";
import Emulator from "./Emulator";
import Unit from "./Unit";
import styles from "./EmulatorRunner.module.css";

const COMPONENT_BORDER_RADIUS = 8;
const REFRESH_DEBOUNCE_MS = 500;

export default class EmulatorRunner extends PureComponent {
	render() {
		const { rom, error, saveState } = this.props;

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
									customInactiveIcon="⚠️"
									customInactiveMessage="using_default_emulator"
								/>
								<Unit
									icon="🗜️"
									name={locales.get("mappers")}
									completed={this._unlockedUnits.useMappers}
									active={this._emulatorSettings.useMappers}
									onToggle={() => this._onToggle("useMappers")}
									style={{ borderBottomRightRadius: COMPONENT_BORDER_RADIUS }}
									customInactiveIcon="⚠️"
									customInactiveMessage="using_default_emulator"
								/>
							</div>
						</div>
						<Unit
							icon="🔥"
							name={locales.get("hot_reload")}
							completed={true}
							active={this._emulatorSettings.withHotReload}
							onToggle={() => this._onToggle("withHotReload")}
							className={classNames(styles.units, styles.standaloneUnit)}
							style={{ borderRadius: COMPONENT_BORDER_RADIUS }}
							customActiveMessage="yes"
							customInactiveMessage="no"
						/>
					</div>
					<div
						className={classNames(
							styles.dragMessage,
							"d-none d-xl-flex d-xxl-flex"
						)}
						onClick={this._openROM}
					>
						📦 {locales.get("drag_and_drop_here")}
					</div>
					<div className={styles.row}>
						<div style={{ opacity: isRunning ? 1 : 0 }} className={styles.row}>
							<span className={styles.label}>⚡️</span>
							<span id="fps" className={styles.label}>
								00
							</span>
							<span className={styles.label}>FPS</span>
							<span className={styles.label}>|</span>
							<Tooltip title={locales.get("using_keyboard")} placement="top">
								<span id="keyboard" className={styles.label}>
									⌨️
								</span>
							</Tooltip>
							<Tooltip
								title={locales.get("using_gamepad")}
								placement="top"
								style={{ display: "none" }}
							>
								<span id="gamepad" className={styles.label}>
									🎮
								</span>
							</Tooltip>
							<span className={styles.label}>|</span>
						</div>
						<VolumeSlider
							volume={null}
							setVolume={(v) => {
								this._volume = v;
								bus.emit("pause-music");
							}}
							defaultVolume={this._volume}
							style={{ marginLeft: 8, width: 64 }}
							className="emu-volume-slider"
						/>
					</div>
				</div>

				<Emulator
					rom={rom}
					error={error?.html}
					saveState={saveState}
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

				<div className={styles.controlButtons}>
					{!!rom && !!error && !!error.debugInfo && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaBug}
							tooltip={locales.get("emulation_debug")}
							onClick={this._debug}
						/>
					)}
					{!!rom && !error && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaExpand}
							tooltip={locales.get("emulation_fullscreen")}
							onClick={this._goFullscreen}
						/>
					)}
					{!!rom && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaSync}
							tooltip={locales.get("emulation_reload")}
							onClick={() => this._reload(false)}
						/>
					)}
					{!!rom && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaStop}
							tooltip={locales.get("emulation_stop")}
							onClick={this._stop}
						/>
					)}
				</div>
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
		const debugInfo = stack?.location; // format: { filePath, lineNumber }

		const html = testContext.javascript.buildHTMLError(e);
		this.props.onError({ html, debugInfo });
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
		const prgRam = header?.hasPrgRam ? "✅" : "❌";

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

	_debug = () => {
		const { filePath, lineNumber } = this.props.error.debugInfo;
		store.dispatch.savedata.openFile(filePath);
		setTimeout(() => {
			if (_.isFinite(lineNumber))
				bus.emit("highlight", { line: lineNumber - 1 });
		});
		Level.current.highlightMultiFileEditor();
	};

	_goFullscreen = () => {
		this._emulator.toggleFullscreen();
	};

	_reload = (useSaveStateIfPossible = false) => {
		const saveState =
			(useSaveStateIfPossible &&
				this._emulatorSettings.withHotReload &&
				this._emulator?.neees?.getSaveState()) ||
			null;

		this.props.onRestart(saveState);
	};

	_stop = () => {
		this.props.onStop();
	};

	_openROM = () => {
		filepicker.open(".neees,.nes", (fileContent) => {
			this.props.onLoadROM(fileContent);
		});
	};

	_onToggle = (setting) => {
		const currentSettings = this._emulatorSettings;
		this._emulatorSettings = {
			...currentSettings,
			[setting]: !currentSettings[setting],
		};
		if (currentSettings[setting] !== this._emulatorSettings[setting]) {
			this.forceUpdate();
			this._reload(true);
		}
	};

	_onCodeChanged = () => {
		if (!this.props.rom) return;

		this._reload(true);
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
			withLatestCode: true,
			withHotReload: settings.withHotReload,
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
