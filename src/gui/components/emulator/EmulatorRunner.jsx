import React, { PureComponent } from "react";
import $path from "path-browserify-esm";
import {
	FaBug,
	FaExpand,
	FaSave,
	FaSearch,
	FaStop,
	FaSync,
	FaUpload,
} from "react-icons/fa";
import classNames from "classnames";
import _ from "lodash";
import filesystem, { Drive } from "../../../filesystem";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import testContext from "../../../terminal/commands/test/context";
import { bus, filepicker, toast } from "../../../utils";
import { getFilePickerFilter } from "../../rom";
import music from "../../sound/music";
import IconButton from "../widgets/IconButton";
import InputTypeToggle from "../widgets/InputTypeToggle";
import VolumeSlider from "../widgets/VolumeSlider";
import Emulator from "./Emulator";
import Unit from "./Unit";
import integrations from "./integrations";
import styles from "./EmulatorRunner.module.css";

const COMPONENT_BORDER_RADIUS = 8;

export default class EmulatorRunner extends PureComponent {
	state = { integrationId: null };
	didUseSaveState = false;

	setIntegration(integrationId) {
		this.setState({ integrationId });
	}

	render() {
		const { rom, name, error, saveState } = this.props;
		const { integrationId } = this.state;

		const isRunning = rom && !error;
		const currentLevel = Level.current;
		const isFreeMode = currentLevel.isFreeMode();

		const Integration = integrations.get(integrationId);

		let ppuSuffix = "";
		if (this._emulatorSettings.usePPU) {
			ppuSuffix = currentLevel.usesPartialPPU
				? locales.get("current_level")
				: currentLevel.usesPartialAPU
				? locales.get("last_version")
				: "";
		}
		let apuSuffix = "";
		if (this._emulatorSettings.useAPU) {
			apuSuffix = currentLevel.usesPartialAPU
				? locales.get("current_level")
				: currentLevel.usesPartialPPU
				? locales.get("last_version")
				: "";
		}

		if (
			this._emulatorSettings.usePPU &&
			this._emulatorSettings.useAPU &&
			(currentLevel.usesPartialPPU || currentLevel.usesPartialAPU)
		) {
			ppuSuffix += locales.get("default_bus");
			apuSuffix += locales.get("default_bus");
		}

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
					{!isFreeMode && integrationId == null && (
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
										disabled={this._emulatorSettings.useConsole}
									/>
									<Unit
										icon="🖥️"
										name={locales.get("ppu")}
										completed={this._unlockedUnits.usePPU}
										active={this._emulatorSettings.usePPU}
										onToggle={() => this._onToggle("usePPU")}
										suffix={ppuSuffix}
										disabled={this._emulatorSettings.useConsole}
									/>
									<Unit
										icon="🔊"
										name={locales.get("apu")}
										completed={this._unlockedUnits.useAPU}
										active={this._emulatorSettings.useAPU}
										onToggle={() => this._onToggle("useAPU")}
										suffix={apuSuffix}
										disabled={this._emulatorSettings.useConsole}
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
										disabled={this._emulatorSettings.useConsole}
										style={{ borderBottomLeftRadius: COMPONENT_BORDER_RADIUS }}
									/>
									<Unit
										icon="🎮"
										name={locales.get("controller")}
										completed={this._unlockedUnits.useController}
										active={this._emulatorSettings.useController}
										onToggle={() => this._onToggle("useController")}
										disabled={this._emulatorSettings.useConsole}
									/>
									<Unit
										icon="🕹️"
										name={locales.get("emulator")}
										completed={this._unlockedUnits.useConsole}
										active={this._emulatorSettings.useConsole}
										onToggle={() => this._onToggle("useConsole")}
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
					)}
					{integrationId != null && (
						<div className={styles.integration}>
							<Integration getNEEES={() => this._emulator?.neees} />
						</div>
					)}
					{integrationId == null && (
						<div
							className={classNames(
								styles.dragMessage,
								isFreeMode ? "d-flex" : "d-none d-xl-flex d-xxl-flex"
							)}
							onClick={this._openROM}
						>
							📦 {locales.get("drag_and_drop_here")}
						</div>
					)}
					<div className={styles.row}>
						<div
							style={{ display: isRunning ? "flex" : "none" }}
							className={styles.row}
						>
							<span className={styles.label}>⚡️</span>
							<span id="fps" className={styles.label}>
								00
							</span>
							<span className={styles.label}>FPS</span>
							<span className={styles.label}>|</span>
							<InputTypeToggle player={1} className={styles.label} />
							<InputTypeToggle player={2} className={styles.label} />
							<span className={styles.label}>|</span>
						</div>
						<VolumeSlider
							volume={null}
							setVolume={(v) => {
								this._volume = v;
								music.pause();
							}}
							defaultVolume={this._volume}
							style={{ marginLeft: 8, width: 64 }}
							className="emu-volume-slider"
						/>
					</div>
				</div>

				<Emulator
					rom={rom}
					name={name}
					error={error?.html}
					saveState={saveState}
					settings={this._emulatorSettings}
					volume={this._volume}
					onStart={this._focusEmulator}
					onError={this._setError}
					onFps={this._setFps}
					onFrame={this._setInfo}
					onStop={this._clearInfo}
					ref={(ref) => {
						this._emulator = ref;
					}}
				/>

				<pre
					className={styles.info}
					style={{ display: isFreeMode ? "none" : undefined }}
					ref={(ref) => {
						this._info = ref;
					}}
				/>

				<div className={styles.controlButtons}>
					{!!rom && !!error && !!error.debugInfo && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaSearch}
							tooltip={locales.get("emulation_go_to_error")}
							onClick={this._goToError}
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
					{!!rom && !error && !isFreeMode && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaBug}
							tooltip={locales.get("emulation_open_debugger")}
							onClick={this._openDebugger}
						/>
					)}
					{!!rom && !error && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaSave}
							tooltip={locales.get("emulation_save_state")}
							onClick={this._saveStateToFile}
						/>
					)}
					{!!rom && !error && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaUpload}
							tooltip={locales.get("emulation_load_state")}
							onClick={this._loadStateFromFile}
						/>
					)}
					{!!rom && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaSync}
							tooltip={locales.get("emulation_reload")}
							onClick={() => this._reload(false, true)}
						/>
					)}
					{!!rom && integrationId == null && (
						<IconButton
							style={{ marginRight: 8 }}
							Icon={FaStop}
							tooltip={locales.get("emulation_stop")}
							onClick={this.stop}
						/>
					)}
				</div>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
			"sync-emulator": this._onEmulatorSync,
			"unit-unlocked": this._refreshView,
			"free-mode-settings-changed": this._refreshView,
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	stop = () => {
		this._emulator?.stop();
		this.props.onStop();
		this.didUseSaveState = false;
	};

	_setError = (e) => {
		console.error(e);

		const stack = testContext.javascript.buildStack(e);
		const debugInfo = stack?.location; // format: { filePath, lineNumber }

		const html = testContext.javascript.buildHTMLError(e);
		this.props.onError({ html, debugInfo });
	};

	_setFps = (fps) => {
		if (!this._container) return;

		const cappedFps = Math.min(fps, 60);
		const formattedFps = `${cappedFps}`.padStart(2, "0");
		this._container.querySelector("#fps").textContent = formattedFps;
	};

	_setInfo = (__, neees) => {
		const name =
			this.props.name != null
				? `<strong style="display: flex; justify-content: center">${this.props.name}</strong>`
				: "";

		const header = neees?.context?.cartridge?.header;
		const mapperId = header?.mapperId ?? "❓";
		const mapperName = neees?.context?.mapper?.constructor?.name ?? "❓";
		const mirroringId =
			neees?.ppu?.memory?.mirroringId ?? header?.mirroringId ?? "❓";
		const chr = header?.usesChrRam ? "RAM" : "ROM";
		const prgRam = header?.hasPrgRam ? "✅" : "❌";

		this._info.innerHTML =
			name +
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

	_goToError = () => {
		const { filePath, lineNumber } = this.props.error.debugInfo;
		if (window._openPath_(filePath)) {
			setTimeout(() => {
				if (_.isFinite(lineNumber))
					bus.emit("highlight", {
						line: lineNumber - 1,
						reason: "debug-button",
					});
			});
			Level.current.highlightMultiFileEditor();
		}
	};

	_goFullscreen = () => {
		this._emulator.toggleFullscreen();
	};

	_openDebugger = () => {
		Level.current.launchDebugger();
	};

	_saveStateToFile = () => {
		try {
			const { name } = this.props;
			if (!name) return;

			const neees = this._emulator?.neees;
			if (!neees) return;

			const state = neees.getSaveState();
			const saveStatePath = `${Drive.SAVE_DIR}/${name}.state`;
			filesystem.write(saveStatePath, JSON.stringify(state));
			toast.success(locales.get("save_state_saved"));
		} catch (e) {
			console.error("💥 Error saving state", e);
			toast.error(locales.get("the_operation_failed"));
		}
	};

	_loadStateFromFile = () => {
		try {
			const { name } = this.props;
			if (!name) return;

			const neees = this._emulator?.neees;
			if (!neees) return;

			const saveStatePath = `${Drive.SAVE_DIR}/${name}.state`;
			if (!filesystem.exists(saveStatePath)) {
				toast.error(locales.get("save_state_not_found"));
				return;
			}

			const raw = filesystem.read(saveStatePath);
			const state = JSON.parse(raw);
			neees?.setSaveState?.(state);
			toast.success(locales.get("save_state_loaded"));
			this.didUseSaveState = true;
		} catch (e) {
			console.error("💥 Error loading state", e);
			toast.error(locales.get("the_operation_failed"));
		}
	};

	_reload = (isFullReload = false, forceReset = false) => {
		if (!!this.props.error) {
			isFullReload = true;
			forceReset = true;
		}

		const keepState = this._emulatorSettings.withHotReload && !forceReset;

		if (isFullReload) {
			const saveState =
				(keepState &&
					(() => {
						try {
							return this._emulator?.neees?.getSaveState();
						} catch (e) {
							console.error(e);
							return null;
						}
					})()) ||
				null;
			this.stop();
			this.props.onRestart(saveState);
		} else {
			this._emulator?.reloadCode(keepState);
		}
	};

	_openROM = () => {
		filepicker.open(getFilePickerFilter(), (fileContent, fileName) => {
			const name = $path.parse(fileName).name;
			this.props.onLoadROM(fileContent, name);
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

		this._focusEmulator();
	};

	_focusEmulator() {
		setTimeout(() => {
			document.getElementById("emulator")?.focus();
		});
	}

	_onEmulatorSync = () => {
		if (!this.props.rom) return;

		this._reload(false);
	};

	_refreshView = () => {
		this.forceUpdate();
	};

	get _emulatorSettings() {
		const { integrationId } = this.state;
		const hasIntegration = integrationId != null;
		const settings = store.getState().savedata.emulatorSettings;
		const unlockedUnits = this._unlockedUnits;

		return {
			useCartridge:
				(unlockedUnits.useCartridge && settings.useCartridge) || hasIntegration,
			useCPU: (unlockedUnits.useCPU && settings.useCPU) || hasIntegration,
			usePPU: (unlockedUnits.usePPU && settings.usePPU) || hasIntegration,
			useAPU: (unlockedUnits.useAPU && settings.useAPU) || hasIntegration,
			useController:
				(unlockedUnits.useController && settings.useController) ||
				hasIntegration,
			useConsole: hasIntegration
				? false
				: unlockedUnits.useConsole && settings.useConsole,
			withLatestCode: true,
			withHotReload: settings.withHotReload || hasIntegration,
			syncToVideo: settings.syncToVideo,
			audioBufferSize: settings.audioBufferSize,
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
