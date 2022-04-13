import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import Terminal from "react-console-emulator";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
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
				<div className={styles.column}>
					<CodeMirror
						className={styles.editor}
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
						height="100%"
						theme={oneDark}
						extensions={[javascript({})]}
						onChange={(value, viewUpdate) => {
							console.log("value:", value);
						}}
						autoFocus
					/>
				</div>

				<div className={styles.column}>
					<div className={styles.row} id="preview"></div>
					<div className={styles.row}>
						<Terminal
							commands={commands}
							welcomeMessage={"Welcome to the React terminal!"}
							promptLabel={"me@emudevz:~$"}
							style={{ backgroundColor: "#42424277", width: "100%" }}
							contentStyle={{ height: "5vh" }}
						/>
					</div>
				</div>
			</div>
		);
	}

	componentDidMount() {
		const preview = document.querySelector("#preview");

		const $interval = setInterval(() => {
			if (preview.clientWidth > 0) {
				clearInterval($interval);

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

				app.view.style.borderRadius = "8px";
				preview.appendChild(app.view);
			}
		}, 1);
	}
}
