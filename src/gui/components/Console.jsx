import React, { PureComponent } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { ImageAddon } from "@xterm/addon-image";
import { XTerm } from "updated-xterm-for-react";
import dictionary from "../../data/dictionary";
import locales from "../../locales";
import Terminal from "../../terminal/Terminal";
import { bus } from "../../utils";
import styles from "./Console.module.css";

const imageAddonSettings = {
	enableSizeReports: true, // whether to enable CSI t reports (see below)
	pixelLimit: 16777216, // max. pixel size of a single image
	sixelSupport: true, // enable sixel support
	sixelScrolling: true, // whether to scroll on image output
	sixelPaletteLimit: 256, // initial sixel palette size
	sixelSizeLimit: 25000000, // size limit of a single sixel sequence
	storageLimit: 128, // FIFO storage limit in MB
	showPlaceholder: true, // whether to show a placeholder for evicted images
	iipSupport: true, // enable iTerm IIP support
	iipSizeLimit: 20000000, // size limit of a single IIP sequence
};

export default class Console extends PureComponent {
	static get id() {
		return "Console";
	}

	fitAddon = new FitAddon();
	imageAddon = new ImageAddon(imageAddonSettings);

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
					addons={[this.fitAddon, this.imageAddon]}
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
		this.terminal = new Terminal(xterm, dictionary);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
		this.terminal.dispose();
	}

	_onResize = () => {
		this.fitAddon.fit();
	};

	_onKeyDownCapture = (e) => {
		const isCtrlP = (e.ctrlKey || e.metaKey) && e.code === "KeyP";
		if (isCtrlP) {
			e.preventDefault();
			bus.emit("file-search");
		}

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
