import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import classNames from "classnames";
import styles from "./MainScreen.module.css";

export default class MainScreen extends PureComponent {
	render() {
		return (
			<div className={styles.container}>
				<CodeMirror
					className={styles.pane}
					value="console.log('hello world!');"
					width="100%"
					height="50vh"
					theme={oneDark}
					extensions={[javascript({})]}
					onChange={(value, viewUpdate) => {
						console.log("value:", value);
					}}
				/>
				<div id="preview" className={classNames(styles.pane, styles.preview)} />
			</div>
		);
	}

	componentDidMount() {
		// The application will create a renderer using WebGL, if possible,
		// with a fallback to a canvas render. It will also setup the ticker
		// and the root stage PIXI.Container
		const app = new PIXI.Application({
			resizeTo: window,
			backgroundAlpha: 0.5,
		});
		const graphics = new PIXI.Graphics();
		app.stage.addChild(graphics);

		let a = 1;
		app.ticker.add(function (delta) {
			graphics.clear();

			// Rectangle
			graphics.beginFill(0xff0000);
			graphics.drawRect(50 + ++a, 50, 100, 100);
			graphics.endFill();
		});

		// The application will create a canvas element for you that you
		// can then insert into the DOM
		document.querySelector("#preview").appendChild(app.view);
	}
}
