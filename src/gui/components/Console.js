import React, { PureComponent } from "react";
import { XTerm } from "xterm-for-react";
import { FitAddon } from "xterm-addon-fit";
import Terminal from "../terminal/Terminal";
import styles from "./Console.module.css";

export default class Console extends PureComponent {
	fitAddon = new FitAddon();

	render() {
		return (
			<div
				className={styles.xtermContainer}
				onKeyDownCapture={this._onKeyDownCapture}
			>
				<XTerm
					className={styles.xtermContainer}
					options={{
						cursorBlink: true,
						theme: { background: "#111111" },
					}}
					addons={[this.fitAddon]}
					ref={(ref) => {
						this.ref = ref;
					}}
				/>
			</div>
		);
	}

	focus = () => {
		this.ref.terminal.focus();
	};

	_onResize = () => {
		this.fitAddon.fit();
	};

	_onKeyDownCapture = (e) => {
		if (
			(e.code === "ArrowLeft" ||
				e.code === "ArrowRight" ||
				e.code === "ArrowUp" ||
				e.code === "ArrowDown") &&
			e.altKey
		)
			e.preventDefault();
	};

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
		this._onResize();

		const xterm = this.ref.terminal;
		this.terminal = new Terminal(xterm).start();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}
}
