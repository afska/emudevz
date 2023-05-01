import React, { PureComponent } from "react";
import { FaGlasses, FaVideo } from "react-icons/fa";
import classNames from "classnames";
import locales from "../../../locales";
import store from "../../../store";
import Tooltip from "../../components/widgets/Tooltip";
import VolumeSlider from "../../components/widgets/VolumeSlider";
import IconButton from "../widgets/IconButton";
import Emulator from "./Emulator";
import integrations from "./integrations";
import styles from "./GameStreamer.module.css";

const INITIAL_ZOOM_DELAY = 3000;
const ZOOM_DELAY = 1000;

export default class GameStreamer extends PureComponent {
	state = { rom: null, integrationId: null };

	setIntegration(integrationId) {
		this.setState({ integrationId });
	}

	zoom = () => {
		this._changeZoomTo(styles.zoom, "megaZoom", INITIAL_ZOOM_DELAY);
	};

	megaZoom = () => {
		this._changeZoomTo(styles.megazoom, "megaZoomOut");
	};

	megaZoomOut = () => {
		this._changeZoomTo(styles.megazoomout, "megaZoom");
	};

	clearZoom() {
		this._stream.classList.remove(styles.zoom);
		this._stream.classList.remove(styles.megazoom);
		this._stream.classList.remove(styles.megazoomout);
	}

	render() {
		const { rom: propsRom } = this.props;
		const { rom: stateRom, integrationId } = this.state;
		const rom = propsRom || stateRom;

		const Integration = integrations.get(integrationId);

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
						<Tooltip title={locales.get("streaming_video")} placement="top">
							<span>
								<FaVideo />
							</span>
						</Tooltip>
						<span
							ref={(ref) => {
								this._zoomButton = ref;
							}}
							style={{ opacity: 0, marginLeft: 8, marginBottom: 0 }}
						>
							<IconButton
								Icon={FaGlasses}
								onClick={() => {
									if (this._nextZoom) this[this._nextZoom]();
								}}
							/>
						</span>
					</div>

					<Integration getNEEES={() => this._emulator?.neees} />

					<div className={styles.row}>
						<Tooltip title={locales.get("using_keyboard")} placement="top">
							<span id="keyboard" style={{ marginTop: 3 }}>
								⌨️
							</span>
						</Tooltip>
						<Tooltip
							title={locales.get("using_gamepad")}
							placement="top"
							style={{ display: "none", marginTop: 3 }}
						>
							<span id="gamepad">🎮</span>
						</Tooltip>
						<span>&nbsp;</span>
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

				<div className={styles.video}>
					<div
						className={styles.stream}
						ref={(ref) => {
							this._stream = ref;
							this._onResize();
						}}
					>
						<img
							src="assets/stream.jpg"
							alt="Background"
							className={styles.backgroundImage}
						/>

						<div className={styles.pointLight} />

						<div
							id="tvScreen"
							style={{
								position: "absolute",
								width: 256,
								height: 240,
								zIndex: 1,
								clipPath:
									'path("M 16.597 33.729 C 4.921 21.211 167.519 13.919 237.56 32.364 C 245.389 32.364 251.454 53.775 249.205 48.235 C 255.638 53.16 261.012 200.57 250.436 195.09 C 258.092 186.709 245.874 210.207 236.67 211.313 C 175.573 223.497 93.096 225.671 21.648 211.313 C 13.819 211.313 -0.962 199.349 6.445 200.802 C 0.781 221.1 -4.372 78.351 6.268 47.794 C 8.159 35.901 21.809 24.348 23.139 31.395")',
								transformOrigin: "top left",
							}}
						>
							<Emulator
								crt
								autoSaveAndRestore={integrationId}
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
					</div>
				</div>
			</div>
		);
	}

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
	}

	_setInputType = (inputType) => {
		if (!this._container) return;
		this._container.querySelector("#keyboard").style.display =
			inputType === "keyboard" ? "block" : "none";
		this._container.querySelector("#gamepad").style.display =
			inputType === "gamepad" ? "block" : "none";
	};

	_onResize = () => {
		if (!this._stream) return;

		const outer = this._stream;
		const inner = outer.querySelector("#tvScreen");

		const innerX = 178;
		const innerY = 135;
		const innerScaleX = 0.82;
		const innerScaleY = 0.7;
		const baseOuterWidth = 517;
		const baseOuterHeight = 484;

		const innerXRatio = innerX / baseOuterWidth;
		const innerYRatio = innerY / baseOuterHeight;
		const outerWidth = outer.clientWidth;
		const outerHeight = outer.clientHeight;

		const x = outerWidth * innerXRatio;
		const y = outerHeight * innerYRatio;
		const scaleX = (outerWidth / baseOuterWidth) * innerScaleX;
		const scaleY = (outerHeight / baseOuterHeight) * innerScaleY;

		inner.style.left = `${x}px`;
		inner.style.top = `${y}px`;
		inner.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
	};

	_changeZoomTo(style, next, delay = ZOOM_DELAY) {
		this.clearZoom();
		this._stream.classList.add(style);
		this._nextZoom = undefined;
		this._zoomButton.style.opacity = 0;
		this._zoomButton.style.pointerEvents = "none";
		setTimeout(() => {
			this._nextZoom = next;
			this._zoomButton.style.opacity = 1;
			this._zoomButton.style.pointerEvents = "auto";
		}, delay);
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
