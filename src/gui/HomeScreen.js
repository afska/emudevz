import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import styles from "./HomeScreen.module.css";

class HomeScreen extends PureComponent {
	get isReady() {
		// TODO: REMOVE HACK
		return document.querySelector("body").clientWidth > 0;
	}

	render() {
		if (!this.isReady) return false;

		return <div id="home" className={styles.container} />;
	}

	componentDidMount() {
		const $interval = setInterval(() => {
			if (this.isReady) {
				clearInterval($interval);

				this.forceUpdate(() => {
					this.onReady();
				});
			}
		}, 1);
	}

	onReady = () => {
		const preview = document.querySelector("#home"); // TODO: USE REF
		const app = new PIXI.Application({
			resizeTo: preview,
			backgroundColor: 0x333333,
		});
		const graphics = new PIXI.Graphics();
		app.stage.addChild(graphics);
		app.ticker.add(function (delta) {
			graphics.clear();
			for (let x = 0; x < app.renderer.width; x++) {
				graphics.beginFill(0xff0000);
				graphics.drawRect(x, 10, 1, 1);
				graphics.endFill();
			}
		});
		preview.appendChild(app.view);
	};
}

export default HomeScreen;
