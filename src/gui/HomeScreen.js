import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import { Layer, Stage } from "@pixi/layers";
import { PointLight, lightGroup } from "pixi-lights";
import { CRTFilter } from "pixi-filters";
import SettingsModal from "./SettingsModal";
import Button from "./components/widgets/Button";
import { connect } from "react-redux";
import locales from "../locales";
import styles from "./HomeScreen.module.css";

const ASSET_LOGO = "/assets/logo.png";
const ASSET_BACKGROUND = "/assets/tiling-background.png";
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

class HomeScreen extends PureComponent {
	render() {
		const { isSettingsOpen, play, setSettingsOpen } = this.props;

		return (
			<>
				<div className={styles.container} ref={this.onReady} />

				<SettingsModal
					open={isSettingsOpen}
					setSettingsOpen={setSettingsOpen}
				/>

				<div id="ui" className={styles.ui}>
					<div className={styles.box}>{locales.get("plot")}</div>

					<div className={styles.buttons}>
						<Button onClick={play}>{locales.get("button_play")}</Button>
						<Button>{locales.get("button_chapter_selection")}</Button>
						<Button onClick={this._openSettings}>
							{locales.get("button_settings")}
						</Button>
						<Button>{locales.get("button_quit")}</Button>
					</div>
				</div>
			</>
		);
	}

	onReady = (div) => {
		if (!div) return;

		const loader = PIXI.Loader.shared;
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
}

const mapStateToProps = ({ level }) => ({
	isSettingsOpen: level.isSettingsOpen,
});
const mapDispatchToProps = ({ level }) => ({
	play: level.goToLastUnlockedLevel,
	setSettingsOpen: level.setSettingsOpen,
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
