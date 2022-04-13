import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import Terminal from "react-console-emulator";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import classNames from "classnames";
import styles from "./MainScreen.module.css";

const commands = {
	echo: {
		description: "Echo a passed string.",
		usage: "echo <string>",
		fn: function () {
			return `${Array.from(arguments).join(" ")}`;
		},
	},
};

export default class MainScreen extends PureComponent {
	render() {
		return (
			<div className={styles.container}>
				<div className={styles.row}>
					<CodeMirror
						className={styles.pane}
						value={`// Describes a CPU

return function() {
	return {
		cycle: 0,
		memory: new Array(1024),
		registers: {
			A: 0,
			Z: 0,
			N: 0
		}
	}
}`}
						width="100%"
						theme={oneDark}
						extensions={[javascript({})]}
						onChange={(value, viewUpdate) => {
							console.log("value:", value);
						}}
						autoFocus
					/>
					<div
						id="preview"
						className={classNames(styles.pane, styles.preview)}
					/>
				</div>

				<div className={styles.pane}>
					<Terminal
						commands={commands}
						welcomeMessage={"Welcome to the React terminal!"}
						promptLabel={"me@emudevz:~$"}
						style={{ backgroundColor: "#42424277", width: "100%" }}
						contentStyle={{ height: "5vh" }}
					/>
				</div>
			</div>
		);
	}

	componentDidMount() {
		document.querySelector("#root").classList.add("crt");

		const app = new PIXI.Application({
			resizeTo: window,
			backgroundColor: "black",
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

		app.view.style.borderRadius = "8px";
		document.querySelector("#preview").appendChild(app.view);
	}
}
