import React, { PureComponent } from "react";
import { XTerm } from "updated-xterm-for-react";
import { FitAddon } from "xterm-addon-fit";
import dictionary from "../../data/dictionary";
import locales from "../../locales";
import {
	TERMINAL_ANSI_INDICES,
	getDefaultTerminalAnsiTheme,
} from "../../models/themes/theme";
import store from "../../store";
import Terminal from "../../terminal/Terminal";
import { bus, dlc } from "../../utils";
import { ansi256ToHex } from "../../utils/ansi256";
import { checkKeyBinding } from "../../utils/keyBindings";
import styles from "./Console.module.css";

const ImageAddon = window.ImageAddon.ImageAddon;

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
			args.startup,
			args.links
		);
	}

	render() {
		const savedata = (dlc.installed() && store.getState().savedata) || {};
		const consoleTheme = savedata.consoleTheme || {};
		const terminalAnsiTheme = savedata.terminalAnsiTheme || {};
		const theme = buildTheme(consoleTheme, terminalAnsiTheme);

		return (
			<div
				className={styles.xtermContainer}
				onKeyDownCapture={this._onKeyDownCapture}
				ref={(ref) => {
					if (!ref) return;
					this._container = ref;
				}}
			>
				<XTerm
					className={styles.xtermContainer}
					options={{
						cursorBlink: true,
						smoothScrollDuration: 50,
						allowProposedApi: true,
						theme,
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

		this._subscriber = bus.subscribe({
			"theme-changed": this._refreshTheme,
			"console-changed": this._blink,
		});
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
		this.terminal.dispose();
		this._subscriber.release();
	}

	_onResize = () => {
		this.fitAddon.fit();
	};

	_onKeyDownCapture = (e) => {
		if (checkKeyBinding(e, "fileSearch")) {
			e.preventDefault();
			bus.emit("file-search");
		}

		if (
			checkKeyBinding(e, "paneNavigationUp") ||
			checkKeyBinding(e, "paneNavigationDown") ||
			checkKeyBinding(e, "paneNavigationLeft") ||
			checkKeyBinding(e, "paneNavigationRight")
		)
			e.preventDefault();
	};

	_refreshTheme = () => {
		const term = this.ref?.terminal;
		if (!term) return;

		const savedata = (dlc.installed() && store.getState().savedata) || {};
		const consoleTheme = savedata.consoleTheme || {};
		const terminalAnsiTheme = savedata.terminalAnsiTheme || {};

		const currentTheme = term.options.theme || {};
		const theme = buildTheme(consoleTheme, terminalAnsiTheme);

		term.options.theme = {
			...currentTheme,
			...theme,
		};
		term.refresh(0, term.rows - 1);
	};

	_blink = () => {
		this._container.classList.remove("quickflash");

		setTimeout(() => {
			try {
				this._container.classList.add("quickflash");
			} catch (e) {
				// maybe already detached
			}
		});
	};
}

function buildTheme(consoleTheme, terminalAnsiTheme) {
	const {
		background,
		cursor,
		cursorAccent,
		foreground,
		selectionBackground,
		selectionForeground,
		bgHighlight,
		bgNew,
	} = consoleTheme;

	const extendedAnsi = buildExtendedAnsi(terminalAnsiTheme);

	return {
		background: background || "#111111",
		cursor: cursor || "#ffffff",
		cursorAccent: cursorAccent || "#111111",
		foreground: foreground || "#ffffff",
		selectionBackground: selectionBackground || "#ffffff4d",
		selectionForeground: selectionForeground || "",
		black: bgHighlight || "#2e3436",
		magenta: bgNew || "#75507b",
		extendedAnsi,
	};
}

function buildExtendedAnsi(terminalAnsiTheme) {
	const defaults = getDefaultTerminalAnsiTheme();
	const extendedAnsi = Array.from({ length: 256 - 16 }, (_, i) =>
		ansi256ToHex(i + 16)
	);

	Object.entries(TERMINAL_ANSI_INDICES).forEach(([key, index]) => {
		const pos = index - 16;
		if (pos < 0 || pos >= extendedAnsi.length) return;

		const hex = terminalAnsiTheme?.[key] || defaults[key] || "#000000";
		extendedAnsi[pos] = hex;
	});

	return extendedAnsi;
}
