import React, { PureComponent } from "react";
import classNames from "classnames";
import locales from "../../../locales";
import store from "../../../store";
import Tooltip from "../../components/widgets/Tooltip";
import VolumeSlider from "../../components/widgets/VolumeSlider";
import Emulator from "./Emulator";
import styles from "./EmulatorRunner.module.css";

export default class GameStreamer extends PureComponent {
	render() {
		const { rom } = this.props;

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
					<div className={styles.row}>
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
					error={null}
					settings={{ useHardware: true }}
					volume={this._volume}
					onError={(err) => {
						throw err;
					}}
					onInputType={this._setInputType}
					onFps={() => {}}
					ref={(ref) => {
						this._emulator = ref;
					}}
				/>
			</div>
		);
	}

	_setInputType = (inputType) => {
		if (!this._container) return;
		this._container.querySelector("#keyboard").style.display =
			inputType === "keyboard" ? "block" : "none";
		this._container.querySelector("#gamepad").style.display =
			inputType === "gamepad" ? "block" : "none";
	};

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
