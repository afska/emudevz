import React, { PureComponent } from "react";
import { Layer, Stage } from "@pixi/layers";
import { CRTFilter } from "pixi-filters";
import { PointLight, lightGroup } from "pixi-lights";
import * as PIXI from "pixi.js";
import { Toaster } from "react-hot-toast";
import { connect } from "react-redux";
import Book from "../level/Book";
import locales from "../locales";
import ChapterSelectModal from "./ChapterSelectModal";
import CreditsModal from "./CreditsModal";
import SettingsModal from "./SettingsModal";
import Button from "./components/widgets/Button";
import ToggableButton from "./components/widgets/ToggableButton";
import styles from "./HomeScreen.module.css";

const ASSET_LOGO = "assets/logo.png";
const ASSET_BACKGROUND = "assets/tiling-background.png";
const UI_SELECTOR = "#ui";
const BACKGROUND_COLOR = 0x000000;
const BACKGROUND_TILE_Y = 60;
const BACKGROUND_ALPHA = 0.35;
const BACKGROUND_SPEED = 2;
const LIGHT_COLOR = 0x854dff;
const LIGHT_LUMINOSITY = 1.5;
const LIGHT_X = 400;
const LIGHT_Y = 50;
const UI_MARGIN = 16;
const SCALE_FACTOR = 0.5;
const CRT_SPEED = 0.25;
const MIN_WIDTH = 512;
const MIN_HEIGHT = 256;

const isChromeOrChromium =
	/Chrome/i.test(navigator.userAgent) || /Chromium/i.test(navigator.userAgent);

class HomeScreen extends PureComponent {
	state = { fontsLoaded: false };

	render() {
		const {
			gameMode,
			isSettingsOpen,
			isChapterSelectOpen,
			isCreditsOpen,
			setGameMode,
			setSettingsOpen,
			setChapterSelectOpen,
			setCreditsOpen,
		} = this.props;
		const { fontsLoaded } = this.state;

		if (!fontsLoaded) return false;

		return (
			<>
				<Toaster containerClassName="toaster-wrapper" />
				<div className={styles.container} ref={this.onReady} />

				<SettingsModal
					open={isSettingsOpen}
					setSettingsOpen={setSettingsOpen}
				/>

				<ChapterSelectModal
					open={isChapterSelectOpen}
					setChapterSelectOpen={setChapterSelectOpen}
				/>

				<CreditsModal open={isCreditsOpen} setCreditsOpen={setCreditsOpen} />

				<div id="ui" className={styles.ui}>
					{isChromeOrChromium ? (
						<div
							className={styles.box}
							dangerouslySetInnerHTML={{ __html: locales.get("plot") }}
						/>
					) : (
						<div
							className={styles.box}
							style={{ backgroundColor: "#ff180078" }}
						>
							😅 This doesn't work well on non Chromium-based web browsers.
							<br />
							💡 Try using another browser.
						</div>
					)}

					<div className={styles.buttons}>
						<ToggableButton
							onClick={this._play}
							options={[
								{
									labelKey: "button_play",
									mode: "campaign",
								},
								{
									labelKey: "mode_free",
									mode: "free",
								},
							]}
							selectedOption={gameMode}
							onOptionSelect={(opt) => setGameMode(opt.mode)}
						/>
						<Button onClick={this._openSettings}>
							{locales.get("button_settings")}
						</Button>
						{window.DESKTOP_MODE && (
							<Button onClick={this._quit}>{locales.get("button_quit")}</Button>
						)}
					</div>

					<div style={{ marginTop: 16, fontSize: 12 }}>
						🧪 {locales.get("_created_by")}{" "}
						<a href="https://r-labs.io" target="_blank" rel="noreferrer">
							[r]labs
						</a>
						{" 🎶 " + locales.get("_music_by") + " "}
						<a
							href="https://open.spotify.com/artist/7ewiTkC0wCMdpx1Wp1z140"
							target="_blank"
							rel="noreferrer"
						>
							Synthenia
						</a>
						{" 📜 "}
						<button
							type="button"
							className="link-button"
							onClick={this._openCredits}
						>
							[{locales.get("_credits")}]
						</button>
					</div>
				</div>
			</>
		);
	}

	componentDidMount() {
		document.fonts.ready.then(() => {
			this.setState({ fontsLoaded: true });
		});
	}

	componentWillUnmount() {
		if (this._app) {
			try {
				const gl = this._app.renderer.gl;
				gl.getExtension("WEBGL_lose_context")?.loseContext();
			} catch (e) {
				console.warn(e);
			}

			try {
				this._app.destroy(true, true);
			} catch (e) {
				console.warn(e);
			}
		}
	}

	onReady = (div) => {
		if (!div) return;

		const loader = new PIXI.Loader();
		loader.reset();
		loader.add("logo", ASSET_LOGO);
		loader.add("background", ASSET_BACKGROUND);

		const sprites = {};
		let logoHeight = 0;
		loader.load((loader, resources) => {
			sprites.logo = new PIXI.Sprite(resources.logo.texture);
			sprites.background = new PIXI.TilingSprite(resources.background.texture);
			logoHeight = resources.logo.texture.height;
		});

		let error = false;
		loader.onError.add(() => {
			error = true;
		});

		loader.onComplete.add(() => {
			if (error) {
				alert("Error loading assets.");
				return;
			}

			sprites.background.tilePosition.y = BACKGROUND_TILE_Y;
			sprites.background.alpha = BACKGROUND_ALPHA;

			const app = new PIXI.Application({
				resizeTo: div,
				backgroundColor: BACKGROUND_COLOR,
			});
			this._app = app;

			app.stage = new Stage();
			const crtFilter = this._createCRTFilter();
			app.stage.filters = [crtFilter];
			app.stage.filterArea = app.screen;

			const lightContainer = new PIXI.Container();
			const light = new PointLight(LIGHT_COLOR, LIGHT_LUMINOSITY);
			lightContainer.addChild(light);

			app.stage.addChild(
				sprites.background,
				sprites.logo,
				new Layer(lightGroup),
				lightContainer
			);

			app.ticker.add(function (delta) {
				sprites.background.width = app.renderer.width;
				sprites.background.height = app.renderer.height;

				const logoScale = (app.renderer.height / logoHeight) * SCALE_FACTOR;
				sprites.logo.scale.x = logoScale;
				sprites.logo.scale.y = logoScale;

				const ui = document.querySelector(UI_SELECTOR);
				if (ui) {
					ui.style.display =
						app.renderer.width >= MIN_WIDTH && app.renderer.height >= MIN_HEIGHT
							? "flex"
							: "none";

					const uiScale = Math.min(
						(app.renderer.width / ui.clientWidth) * SCALE_FACTOR,
						(app.renderer.height / ui.clientHeight) * SCALE_FACTOR,
						1
					);
					ui.style.transform = `translate(-50%, 0) scale(${uiScale})`;
					window.app = app;

					sprites.logo.position.x =
						app.renderer.width / 2 - sprites.logo.width / 2;
					sprites.logo.position.y =
						app.renderer.height / 2 -
						(sprites.logo.height + ui.clientHeight * uiScale) / 2;
					light.x = sprites.logo.x + LIGHT_X * logoScale;
					light.y = sprites.logo.y + LIGHT_Y * logoScale;

					ui.style.top = `${
						sprites.logo.position.y + sprites.logo.height + UI_MARGIN
					}px`;
				}

				crtFilter.time += delta * CRT_SPEED;
				sprites.background.tilePosition.x -= delta * BACKGROUND_SPEED;
			});

			div.appendChild(app.view);
		});
	};

	_createCRTFilter() {
		return new CRTFilter({
			curvature: 5,
			lineWidth: 5,
			lineContrast: 0.25,
			noise: 0.2,
			noiseSize: 1,
			vignetting: 0.3,
			vignettingAlpha: 1,
			vignettingBlur: 0.3,
			seed: 0,
			time: 10,
		});
	}

	_openSettings = () => {
		this.props.setSettingsOpen(true);
	};

	_openCredits = () => {
		this.props.setCreditsOpen(true);
	};

	_play = () => {
		switch (this.props.gameMode) {
			case "free":
				return this._playFreeMode();
			default:
				return this._playCampaign();
		}
	};

	_playCampaign = () => {
		if (this.props.maxChapterNumber > 1) this.props.setChapterSelectOpen(true);
		else this.props.play();
	};

	_playFreeMode = () => {
		this.props.goTo(Book.FREE_MODE_LEVEL);
	};

	_quit = () => {
		window.close();
	};
}

const mapStateToProps = ({ level, savedata }) => ({
	maxChapterNumber: savedata.maxChapterNumber,
	gameMode: savedata.gameMode,
	isSettingsOpen: level.isSettingsOpen,
	isChapterSelectOpen: level.isChapterSelectOpen,
	isCreditsOpen: level.isCreditsOpen,
});
const mapDispatchToProps = ({ level, savedata }) => ({
	play: level.goToLastLevel,
	goTo: level.goTo,
	setGameMode: savedata.setGameMode,
	setSettingsOpen: level.setSettingsOpen,
	setChapterSelectOpen: level.setChapterSelectOpen,
	setCreditsOpen: level.setCreditsOpen,
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
