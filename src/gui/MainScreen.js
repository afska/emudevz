import React, { PureComponent } from "react";
import * as PIXI from "pixi.js";
import Terminal from "react-console-emulator";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import TVNoise from "./TVNoise";
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
	state = { selected: "left", lastVerticalSelection: "bottom" };

	render() {
		const { selected } = this.state;

		return (
			<div className={styles.container}>
				<div
					className={classNames(
						styles.leftColumn,
						styles.column,
						selected === "left" && styles.selected
					)}
					onMouseDown={(e) => {
						this.setState({ selected: "left" });
					}}
				>
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
							// console.log("value:", value);
						}}
						onKeyDownCapture={(e) => {
							if (
								(e.code === "ArrowLeft" ||
									e.code === "ArrowRight" ||
									e.code === "ArrowUp" ||
									e.code === "ArrowDown") &&
								e.altKey
							)
								e.preventDefault();
						}}
						autoFocus
					/>
				</div>

				<div className={classNames(styles.rightColumn, styles.column)}>
					<div
						className={classNames(
							styles.topRow,
							styles.row,
							selected === "top" && styles.selected
						)}
						id="preview"
						onMouseDown={(e) => {
							this.setState({ selected: "top" });
						}}
					>
						<TVNoise />
					</div>
					<div
						className={classNames(
							styles.bottomRow,
							styles.row,
							selected === "bottom" && styles.selected
						)}
						onMouseDown={(e) => {
							this.setState({ selected: "bottom" });
						}}
					>
						<Terminal
							commands={commands}
							welcomeMessage={"Welcome to the React terminal!"}
							promptLabel={"me@consoletest:~$"}
							style={{
								backgroundColor: "#424242",
								width: "100%",
								height: "100%",
								borderRadius: 0,
							}}
							contentStyle={{ height: "5vh" }}
						/>
					</div>
				</div>
			</div>
		);
	}

	onKeyDown = (e) => {
		// TODO: Prevent passing events to CodeMirror

		if (e.key === "ArrowRight" && e.altKey) {
			if (this.state.selected === "left") {
				this.setState({ selected: this.state.lastVerticalSelection });
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowLeft" && e.altKey) {
			if (this.state.selected !== "left") {
				this.setState({
					selected: "left",
					lastVerticalSelection: this.state.selected,
				});
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowUp" && e.altKey) {
			if (this.state.selected === "bottom") {
				this.setState({ selected: "top" });
			}
			e.preventDefault();
			e.stopPropagation();
		}

		if (e.key === "ArrowDown" && e.altKey) {
			if (this.state.selected === "top") {
				this.setState({ selected: "bottom" });
			}
			e.preventDefault();
			e.stopPropagation();
		}
	};

	componentDidMount() {
		window.addEventListener("keydown", this.onKeyDown);

		return;
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

				preview.appendChild(app.view);
			}
		}, 1);
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.onKeyDown);
	}
}
