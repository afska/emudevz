import React, { PureComponent } from "react";
// import * as PIXI from "pixi.js";
import TVNoise from "./TVNoise";

export default class TV extends PureComponent {
	render() {
		return <TVNoise />;
	}

	componentDidMount() {
		// const preview = document.querySelector("#preview"); // TODO: USE REF
		// const app = new PIXI.Application({
		// 	resizeTo: preview,
		// 	backgroundColor: 0x333333,
		// });
		// const graphics = new PIXI.Graphics();
		// app.stage.addChild(graphics);
		// app.ticker.add(function (delta) {
		// 	graphics.clear();
		// 	for (let x = 0; x < app.renderer.width; x++) {
		// 		graphics.beginFill(0xff0000);
		// 		graphics.drawRect(x, 10, 1, 1);
		// 		graphics.endFill();
		// 	}
		// });
		// preview.appendChild(app.view);
	}
}
