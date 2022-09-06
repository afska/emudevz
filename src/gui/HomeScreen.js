import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import styles from "./HomeScreen.module.css";

class HomeScreen extends PureComponent {
	render() {
		return <div id="home" className={styles.container} />;
	}

	componentDidMount() {
		const loader = PIXI.Loader.shared;
		loader.reset();

		loader.add("logo", "logo/logo.png");
		const sprites = {};
		loader.load((loader, resources) => {
			// resources is an object where the key is the name of the resource loaded and the value is the resource object.
			// They have a couple default properties:
			// - `url`: The URL that the resource was loaded from
			// - `error`: The error that happened when trying to load (if any)
			// - `data`: The raw data that was loaded
			// also may contain other properties based on the middleware that runs.
			sprites.logo = new PIXI.Sprite(resources.logo.texture);
			sprites.logo.x = 0;
			sprites.logo.y = 0;
			sprites.logo.scale.x = 0.5;
			sprites.logo.scale.y = 0.5;
		});

		// throughout the process multiple signals can be dispatched.
		loader.onProgress.add(() => {}); // called once per loaded/errored file
		loader.onError.add(() => {}); // called once per errored file
		loader.onLoad.add(() => {}); // called once per loaded file
		loader.onComplete.add(() => {
			const preview = document.querySelector("#home"); // TODO: USE REF
			const app = new PIXI.Application({
				resizeTo: preview,
				backgroundColor: 0x000000,
			});
			app.stage.addChild(sprites.logo);

			// const graphics = new PIXI.Graphics();
			// app.stage.addChild(graphics);
			app.ticker.add(function (delta) {
				sprites.logo.position.x =
					app.renderer.width / 2 - sprites.logo.width / 2;
				sprites.logo.position.y =
					app.renderer.height / 2 - sprites.logo.height / 2;
				// graphics.clear();
				// for (let x = 0; x < app.renderer.width; x++) {
				// 	graphics.beginFill(0xff0000);
				// 	graphics.drawRect(x, 10, 1, 1);
				// 	graphics.endFill();
				// }
			});
			preview.appendChild(app.view);
		}); // called once when the queued resources all load.
	}
}

export default HomeScreen;
