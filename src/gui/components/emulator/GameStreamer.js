import React, { PureComponent } from "react";
import { CRTFilter } from "pixi-filters";
import * as PIXI from "pixi.js";
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

const ZOOM_DELAY = 1000;
const ASSET_BACKGROUND = "assets/stream/main.jpg";
const ASSET_TV = "assets/stream/tv.png";
const ASSET_LIGHTS = {
	tv: "assets/stream/light-tv.png",
	monitor: "assets/stream/light-monitor.png",
	buttons: "assets/stream/light-buttons-and-lamp.png",
};
const LIGHT_STROBE_SPEEDS = {
	// low => slower strobe
	tv: 0.2,
	monitor: 0.005,
	buttons: 0.3,
};
const LIGHT_OPACITY = {
	min: 0.5,
	max: 1,
	range: 0.1,
};
const CRT_SPEED = 0.25;
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

// points in original stream/main.jpg coordinates (before center-crop scaling)
const BUFFER_POINTS = {
	topLeft: { x: 686, y: 194 },
	topRight: { x: 1454, y: 194 },
	bottomLeft: { x: 686, y: 914 },
	bottomRight: { x: 1454, y: 914 },
	// ^^^ (topLeft + (256, 240) * 3)
};

export default class GameStreamer extends PureComponent {
	state = { integrationId: null, isLoading: true };

	setIntegration(integrationId) {
		this.setState({ integrationId });
	}

	zoom = () => {
		this._changeZoomTo(styles.zoom, "megaZoom", 0);
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
		const { id, rom } = this.props;
		const { integrationId, isLoading } = this.state;

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
							<span className="blink">
								<FaVideo />
							</span>
						</Tooltip>
						<span
							ref={(ref) => {
								this._zoomButton = ref;
							}}
							style={{
								opacity: 0,
								pointerEvents: "none",
								marginLeft: 8,
								marginBottom: 0,
							}}
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
						<div ref={this.onReady} className={styles.backgroundImage}>
							{isLoading && (
								<div className={styles.spinnerContainer}>
									<div className={styles.spinner}></div>
								</div>
							)}
						</div>

						<div className={styles.pointLight} />

						<div id="tvScreen">
							<Emulator
								crt
								screen={{
									setBuffer: (buffer) => {
										this._setBuffer(buffer);
									},
								}}
								autoSaveAndRestore={id}
								rom={rom}
								error={null}
								settings={{ useHardware: true }}
								volume={this._volume}
								onError={(err) => {
									console.error(err);
									alert("💥💥💥💥💥");
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
		if (this._app) this._app.destroy(true, true);
	}

	onReady = (div) => {
		if (!div) return;

		const loader = PIXI.Loader.shared;
		loader.reset();
		loader.add("background", ASSET_BACKGROUND);
		loader.add("tv", ASSET_TV);
		Object.entries(ASSET_LIGHTS).forEach(([key, path]) => {
			loader.add(`light_${key}`, path);
		});

		let error = false;
		loader.onError.add(() => {
			error = true;
			this.setState({ isLoading: false });
		});

		loader.load((loader, resources) => {
			this.setState({ isLoading: false });

			if (error) {
				alert("Error loading assets.");
				return;
			}

			const app = new PIXI.Application({
				resizeTo: div,
				backgroundColor: 0x000000,
			});
			this._app = app;

			const background = new PIXI.Sprite(resources.background.texture);
			this._pixiBackground = background;

			const tvOverlay = new PIXI.Sprite(resources.tv.texture);
			this._tvOverlay = tvOverlay;

			const bufferContainer = new PIXI.Container();
			this._bufferContainer = bufferContainer;

			const crtFilter = new CRTFilter({
				curvature: 5,
				lineWidth: 3,
				lineContrast: 0.3,
				noise: 0.2,
				noiseSize: 1,
				vignetting: 0.3,
				vignettingAlpha: 1,
				vignettingBlur: 0.3,
				seed: 0,
				time: 0.5,
			});

			this._crtFilter = crtFilter;

			app.stage.addChild(background);

			app.stage.addChild(bufferContainer);
			app.stage.addChild(tvOverlay);

			this._lightSprites = {};
			const lightOrder = ["tv", "buttons", "monitor"];
			lightOrder.forEach((key) => {
				const sprite = new PIXI.Sprite(resources[`light_${key}`].texture);
				sprite.alpha = LIGHT_OPACITY.min;
				this._lightSprites[key] = sprite;
				app.stage.addChild(sprite);
			});

			app.ticker.add((delta) => {
				if (this._crtFilter) this._crtFilter.time += delta * CRT_SPEED;
				if (!this.props.rom) this._updateNoise();

				Object.entries(this._lightSprites).forEach(([key, sprite]) => {
					const speed = LIGHT_STROBE_SPEEDS[key];
					sprite.alpha =
						LIGHT_OPACITY.min +
						Math.sin(app.ticker.lastTime * speed) * LIGHT_OPACITY.range;
				});
			});

			div.appendChild(app.view);
			this._onResize();
		});
	};

	_setBuffer = (buffer) => {
		if (!this._app || !this._bufferContainer) return;

		if (!this._bufferTexture) {
			const canvas = document.createElement("canvas");
			canvas.width = SCREEN_WIDTH;
			canvas.height = SCREEN_HEIGHT;
			this._bufferCanvas = canvas;
			this._bufferContext = canvas.getContext("2d");
			this._bufferTexture = PIXI.Texture.from(canvas);
			this._bufferTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

			this._imageData = this._bufferContext.getImageData(
				0,
				0,
				SCREEN_WIDTH,
				SCREEN_HEIGHT
			);
			this._buf = new ArrayBuffer(this._imageData.data.length);
			this._buf8 = new Uint8ClampedArray(this._buf);
			this._buf32 = new Uint32Array(this._buf);
		}

		this._buf32.set(buffer);
		this._imageData.data.set(this._buf8);
		this._bufferContext.putImageData(this._imageData, 0, 0);
		this._bufferTexture.update();

		if (!this._bufferSprite) {
			this._bufferSprite = new PIXI.Sprite(this._bufferTexture);
			if (this._crtFilter) {
				this._bufferSprite.filters = [this._crtFilter];
				this._bufferSprite.filterArea = this._app.screen;
			}
			this._bufferContainer.addChild(this._bufferSprite);
		}

		this._updateBufferTransform();
	};

	_updateBufferTransform = () => {
		if (!this._bufferSprite || !this._pixiBackground) return;

		const bg = this._pixiBackground;
		const tex = bg.texture;
		const canvasW = this._app.screen.width;
		const canvasH = this._app.screen.height;
		const imgW = tex.width;
		const imgH = tex.height;
		const scale = Math.max(canvasW / imgW, canvasH / imgH);

		// calculate the actual points after center-crop scaling
		const points = {
			topLeft: {
				x: BUFFER_POINTS.topLeft.x * scale + bg.x,
				y: BUFFER_POINTS.topLeft.y * scale + bg.y,
			},
			topRight: {
				x: BUFFER_POINTS.topRight.x * scale + bg.x,
				y: BUFFER_POINTS.topRight.y * scale + bg.y,
			},
			bottomLeft: {
				x: BUFFER_POINTS.bottomLeft.x * scale + bg.x,
				y: BUFFER_POINTS.bottomLeft.y * scale + bg.y,
			},
			bottomRight: {
				x: BUFFER_POINTS.bottomRight.x * scale + bg.x,
				y: BUFFER_POINTS.bottomRight.y * scale + bg.y,
			},
		};

		// calculate the transform matrix to map the 256x240 sprite to the quadrilateral
		const matrix = new PIXI.Matrix();

		// first, scale the sprite to match the width of the quadrilateral
		const width = Math.hypot(
			points.topRight.x - points.topLeft.x,
			points.topRight.y - points.topLeft.y
		);
		const height = Math.hypot(
			points.bottomLeft.x - points.topLeft.x,
			points.bottomLeft.y - points.topLeft.y
		);
		matrix.scale(width / SCREEN_WIDTH, height / SCREEN_HEIGHT);

		// then, rotate and position to match the quadrilateral
		const angle = Math.atan2(
			points.topRight.y - points.topLeft.y,
			points.topRight.x - points.topLeft.x
		);
		matrix.rotate(angle);
		matrix.translate(points.topLeft.x, points.topLeft.y);

		this._bufferSprite.transform.setFromMatrix(matrix);
	};

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

		if (this._app) {
			this._app.resize();
			if (this._pixiBackground) {
				// (center-crop bg)
				const bg = this._pixiBackground;
				const tex = bg.texture;
				const canvasW = this._app.screen.width;
				const canvasH = this._app.screen.height;
				const imgW = tex.width;
				const imgH = tex.height;
				const scale = Math.max(canvasW / imgW, canvasH / imgH);
				bg.width = imgW * scale;
				bg.height = imgH * scale;
				bg.x = (canvasW - bg.width) / 2;
				bg.y = (canvasH - bg.height) / 2;

				if (this._tvOverlay) {
					this._tvOverlay.width = bg.width;
					this._tvOverlay.height = bg.height;
					this._tvOverlay.x = bg.x;
					this._tvOverlay.y = bg.y;
				}

				Object.values(this._lightSprites).forEach((sprite) => {
					sprite.width = bg.width;
					sprite.height = bg.height;
					sprite.x = bg.x;
					sprite.y = bg.y;
				});

				this._updateBufferTransform();
			}
		}
	};

	_changeZoomTo(style, next, delay = ZOOM_DELAY) {
		this.clearZoom();
		this._stream.classList.add(style);
		this._nextZoom = undefined;
		this._zoomButton.style.opacity = 0;
		this._zoomButton.style.pointerEvents = "none";
		setTimeout(() => {
			this._nextZoom = next;
			if (this._zoomButton != null) {
				this._zoomButton.style.opacity = 1;
				this._zoomButton.style.pointerEvents = "auto";
			}
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

	_updateNoise = () => {
		if (!this._app || !this._bufferContainer) return;

		const len = SCREEN_WIDTH * SCREEN_HEIGHT;
		const noiseBuffer = new Uint32Array(len);
		for (let i = 0; i < len; i++)
			noiseBuffer[i] = ((255 * Math.random()) | 0) << 24;

		this._setBuffer(noiseBuffer);
	};
}
