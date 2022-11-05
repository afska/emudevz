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

		const title =
			(args.title && args.title[locales.language]) ||
			`---${level.name[locales.language]}---` ||
			"?";
		const subtitle =
			(args.subtitle != null
				? args.subtitle[locales.language]
				: locales.get("help_basic")) || null;

		await this.terminal.start(
			title,
			subtitle,
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
						smoothScrollDuration: 50,
						allowProposedApi: true,
						theme: {
							background: "#111111",
							cursor: "#ffffff",
							cursorAccent: "#111111",
						},
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
		this.terminal.dispose();
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
