import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import { Layer, Stage } from "@pixi/layers";
import { PointLight, lightGroup } from "pixi-lights";
import { CRTFilter } from "pixi-filters";
import styles from "./HomeScreen.module.css";

class HomeScreen extends PureComponent {
	render() {
		return <div className={styles.container} ref={this.onReady} />;
	}

	onReady = (div) => {
		if (div == null) return;

		const loader = PIXI.Loader.shared;
		loader.reset();
		loader.add("logo", "assets/logo.png");
		loader.add("background", "assets/tiling-background.png");

		const sprites = {};
		loader.load((loader, resources) => {
			sprites.logo = new PIXI.Sprite(resources.logo.texture);
			sprites.background = new PIXI.TilingSprite(resources.background.texture);
		});

		let error = false;
		loader.onError.add(() => {
			error = true;
		}); // (called once per errored file)

		loader.onComplete.add(() => {
			if (error) {
				alert("Error loading assets.");
				return;
			}

			sprites.background.tilePosition.y = 60;
			sprites.background.alpha = 0.35;

			sprites.logo.x = 0;
			sprites.logo.y = 0;
			sprites.logo.scale.x = 0.4;
			sprites.logo.scale.y = 0.4;

			const app = new PIXI.Application({
				resizeTo: div,
				backgroundColor: 0x000000,
			});

			app.stage = new Stage();
			const crtFilter = new CRTFilter({
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
			app.stage.filters = [crtFilter];
			app.stage.filterArea = app.screen;

			const lightContainer = new PIXI.Container();
			const light = new PointLight(0x854dff, 1.5);
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

				sprites.logo.position.x =
					app.renderer.width / 2 - sprites.logo.width / 2;
				sprites.logo.position.y =
					app.renderer.height / 3 - sprites.logo.height / 2;
				light.x = sprites.logo.x + 160;
				light.y = sprites.logo.y + 30;

				crtFilter.time += delta * 0.25;

				sprites.background.tilePosition.x -= delta * 2;
			});

			div.appendChild(app.view);
		});
	};
}

export default HomeScreen;
