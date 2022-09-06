import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import styles from "./HomeScreen.module.css";

class HomeScreen extends PureComponent {
	render() {
		return <div className={styles.container} ref={this.onReady} />;
	}

	onReady = (div) => {
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
			app.stage.addChild(sprites.logo);

			app.ticker.add(function (delta) {
				sprites.logo.position.x =
					app.renderer.width / 2 - sprites.logo.width / 2;
				sprites.logo.position.y =
					app.renderer.height / 2 - sprites.logo.height / 2;
			});
			div.appendChild(app.view);
		});
	};
}

export default HomeScreen;
