import React, { PureComponent } from "react";
import { XTerm } from "updated-xterm-for-react";
import { FitAddon } from "xterm-addon-fit";
import locales from "../../locales";
import Terminal from "../../terminal/Terminal";
import styles from "./Console.module.css";

export default class Console extends PureComponent {
	fitAddon = new FitAddon();

	async initialize(args, level) {
		this._level = level;

		const welcomeMessage =
			(args.welcomeMessage && args.welcomeMessage[locales.language]) ||
			`---${level.name[locales.language]}---` ||
			"?";

		await this.terminal.start(
			welcomeMessage,
			args.availableCommands,
			args.startup
		);
	}

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

	componentDidMount() {
		window.addEventListener("resize", this._onResize);
		this._onResize();

		const xterm = this.ref.terminal;
		this.terminal = new Terminal(xterm);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resize);
	}

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
}
