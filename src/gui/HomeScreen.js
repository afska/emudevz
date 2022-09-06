import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import { Layer, Stage } from "@pixi/layers";
import { PointLight, lightGroup } from "pixi-lights";
import styles from "./HomeScreen.module.css";

class HomeScreen extends PureComponent {
	render() {
		return <div className={styles.container} ref={this.onReady} />;
	}

	onReady = (div) => {
		if (div == null) return;

		const loader = PIXI.Loader.shared;
		loader.reset();
		loader.add("logo", "logo/logo.png");

		const sprites = {};
		loader.load((loader, resources) => {
			sprites.logo = new PIXI.Sprite(resources.logo.texture);
		});

		let error = false;
		loader.onError.add(() => {
			error = true;
		}); // (called once per errored file)

		loader.onComplete.add(() => {
			sprites.logo.x = 0;
			sprites.logo.y = 0;
			sprites.logo.scale.x = 0.5;
			sprites.logo.scale.y = 0.5;

			const app = new PIXI.Application({
				resizeTo: div,
				backgroundColor: 0x000000,
			});

			app.stage = new Stage();

			const background = new PIXI.Container();
			const light = new PointLight(0x854dff, 1.5);
			background.addChild(light);
			app.stage.addChild(sprites.logo, new Layer(lightGroup), background);

			app.ticker.add(function (delta) {
				sprites.logo.position.x =
					app.renderer.width / 2 - sprites.logo.width / 2;
				sprites.logo.position.y =
					app.renderer.height / 2 - sprites.logo.height / 2;
				light.x = sprites.logo.x + 181;
				light.y = sprites.logo.y + 55;
			});
			div.appendChild(app.view);
		});
	};
}

export default HomeScreen;
