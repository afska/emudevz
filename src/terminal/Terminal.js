import { LinkProvider } from "xterm-link-provider";
import locales from "../locales";
import { async } from "../utils";
import { ansiEscapes } from "../utils/cli";
import PendingInput, { PendingKey } from "./PendingInput";
import Shell from "./Shell";
import highlighter from "./highlighter";
import { theme } from "./style";

const KEY_FULLSCREEN = "[23~";
const KEY_REFRESH_1 = "[15~";
const KEY_REFRESH_2 = "";
const KEY_CTRL_C = "\u0003";
const KEY_BACKSPACE = "\u007F";
const NEWLINE_REGEXP = /\r\n?|\n/g;
const NEWLINE = "\r\n";
const SHORT_NEWLINE = "\n";
const TABULATION_REGEXP = /\t/g;
const TABULATION = "  ";
const CTRL_C = "^C";
const BACKSPACE = "\b \b";
const CANCELED = "canceled";
const INTERRUPTED = "interrupted";
const DISPOSED = "disposed";

// Program interface:
// - async run(args) -> void
// - onStop() -> Boolean

export default class Terminal {
	constructor(xterm) {
		this._xterm = xterm;
		this._input = null;
		this._keyInput = null;

		this._isWriting = false;
		this._speedFlag = false;
		this._stopFlag = false;
		this._disposeFlag = false;

		this._shell = new Shell(this);
		this._currentProgram = null;

		this._xterm.onData((data) => {
			this._onData(data);
		});
		this._xterm.attachCustomKeyEventHandler((e) => {
			this._onKey(e);
		});
		this._xterm.onResize((e) => {
			this._onResize(e);
		});
	}

	async start(
		title = null,
		subtitle = null,
		availableCommands = [],
		startup = null
	) {
		if (title != null) await this.writeln(title, theme.SYSTEM);
		if (subtitle != null) await this.writeln(subtitle, theme.COMMENT);
		this._shell.availableCommands = availableCommands;

		if (startup != null) {
			await this.newline();
			this._shell.runLine(startup);
		} else this.restart();
	}

	async run(program) {
		try {
			this._currentProgram = program;
			await this._currentProgram.run();
		} catch (e) {
			if (e === DISPOSED) return;
			throw e;
		}
	}

	async restart() {
		await this.run(this._shell);
	}

	async writeln(text, style, interval, withHighlight) {
		await this.write(text, style, interval, withHighlight);
		await this.newline();
	}

	async write(text, style = theme.NORMAL, interval = 0, withHighlight = false) {
		if (text.includes("multi")) debugger;
		text = this._normalize(text);

		if (withHighlight) {
			const parts = highlighter.highlightText(text);

			for (let part of parts) {
				if (part.isAccent) await this.write(part.text, theme.ACCENT, interval);
				else if (part.isCode) await this.write(part.text);
				else await this.write(part.text, style, interval);
			}

			return;
		}

		this._isWriting = true;

		if (interval === 0) {
			this._interruptIfNeeded();
			this._xterm.write(style(text));
		} else {
			const characters = [...text];

			for (let i = 0; i < characters.length; i++) {
				this._interruptIfNeeded();

				this._xterm.write(style(characters[i]));
				if (!this._speedFlag) await async.sleep(interval);
			}
		}

		this._isWriting = false;
	}

	async break() {
		await this.write(CTRL_C);
	}

	async newline() {
		await this.write(NEWLINE);
	}

	waitForKey() {
		this.cancelSpeedFlag();
		this._interruptIfNeeded();

		return new Promise((resolve, reject) => {
			this._keyInput = new PendingKey(resolve, reject);
		});
	}

	prompt(
		indicator = "$ ",
		style = theme.ACCENT,
		multiLine = false,
		isValid = (x) => x !== ""
	) {
		this.cancelSpeedFlag();
		this._interruptIfNeeded();

		return new Promise(async (resolve, reject) => {
			this._input = new PendingInput(indicator, isValid, resolve, reject);
			this._input.multiLine = multiLine;
			await this.newline();
			await this.write(indicator, style);
			await async.sleep();
			const { x, y, ybase } = this.buffer;
			this._input.position.x = x;
			this._input.position.y = y + ybase;
		});
	}

	async confirmPrompt() {
		if (this.isExpectingInput) {
			const isValid = this._input.confirm();
			this._input = null;

			if (isValid) await this.newline();
		}
	}

	cancelPrompt(reason = CANCELED) {
		if (this.isExpectingInput) {
			this._input.cancel(reason);
			this._input = null;
		}
	}

	cancelKey(reason = CANCELED) {
		if (this.isExpectingKey) {
			this._keyInput.reject(reason);
			this._keyInput = null;
		}
	}

	async clearInput() {
		while (!this._input.isEmpty()) {
			await async.sleep();
			await this.backspace();
		}
	}

	async backspace() {
		if (this.isExpectingInput) {
			const { x, y, ybase } = this.buffer;
			const absY = y + ybase;
			if (absY === this._input.position.y && x === this._input.position.x)
				return;

			if (x > 0) {
				await this.write(
					x === this.width
						? ansiEscapes.cursorMove(-1) +
								ansiEscapes.cursorMove(1) +
								ansiEscapes.eraseEndLine
						: BACKSPACE
				);
				this._input.backspace();
			} else {
				const newLine = absY - 1;
				const indicatorOffset = this._input.getIndicatorOffset(newLine);
				const lineLength = Math.min(
					this._input.getLineLength(newLine, this.width) + indicatorOffset,
					this.width
				);
				const character = this._input.backspace();

				if (lineLength < this.width) {
					await this.write(ansiEscapes.cursorMove(lineLength, -1));
				} else if (character !== SHORT_NEWLINE) {
					await this.write(
						ansiEscapes.cursorMove(this.width - 1, -1) +
							ansiEscapes.eraseEndLine
					);
				}
			}
		}
	}

	cancelSpeedFlag() {
		this._speedFlag = false;
	}

	registerLinkProvider(regexp, callback) {
		return this._xterm.registerLinkProvider(
			new LinkProvider(this._xterm, regexp, callback)
		);
	}

	clear() {
		this._xterm.clear();
	}

	dispose() {
		this._disposeFlag = true;
	}

	get isExpectingInput() {
		return this._input != null;
	}

	get isExpectingKey() {
		return this._keyInput != null;
	}

	get width() {
		return this._xterm.cols;
	}

	get height() {
		return this._xterm.rows;
	}

	get buffer() {
		return this._xterm._core.buffer;
	}

	async _onData(data) {
		if (data === "") return;
		if (this._processCommonBrowserKeys(data)) return;
		data = this._normalize(data, SHORT_NEWLINE);

		switch (data) {
			case KEY_CTRL_C: {
				const wasExpectingInput = this.isExpectingInput;
				const wasExpectingKey = this.isExpectingKey;

				if (this._currentProgram.onStop()) {
					this.cancelPrompt(INTERRUPTED);
					this.cancelKey(INTERRUPTED);
					await this.break();
					await this.newline();
					if (!wasExpectingInput && !wasExpectingKey) this._requestInterrupt();
				}

				break;
			}
			case KEY_BACKSPACE: {
				await this.backspace();
				break;
			}
			default: {
				if (this.isExpectingKey) {
					this._keyInput.resolve(data);
					this._keyInput = null;
					return;
				}

				if (this.isExpectingInput && this._isValidInput(data)) {
					const isMultiLine = data.split(NEWLINE_REGEXP).length > 1;
					if (isMultiLine && !this._input.multiLine) return;

					await this.write(data);
					this._input.append(data);
				}
			}
		}
	}

	async _onKey(e) {
		const isKeyDown = e.type === "keydown";
		const isEnter = e.key === "Enter";
		const isCtrlShiftC = e.ctrlKey && e.shiftKey && e.key === "C";
		const isShiftEnter = e.shiftKey && isEnter;

		if (isKeyDown && isCtrlShiftC) {
			const selection = this._xterm.getSelection();
			navigator.clipboard.writeText(selection);
			e.preventDefault();
			return;
		}

		if (isKeyDown && isEnter) {
			if (isShiftEnter && this.isExpectingInput && this._input.multiLine) {
				await this.newline();
				this._input.append(SHORT_NEWLINE);
			} else {
				if (this._isWriting) this._speedFlag = true;
				await this.confirmPrompt();
			}
			return;
		}
	}

	async _onResize(e) {
		if (this.isExpectingInput) {
			this.cancelPrompt();
			await async.sleep(1);
			this.clear();
			await this.write("⚠️  " + locales.get("resize_warning"), theme.ACCENT);
			this.cancelPrompt();
		}
	}

	_requestInterrupt() {
		this._stopFlag = true;
	}

	_interruptIfNeeded() {
		if (this._stopFlag) {
			this._stopFlag = false;
			throw INTERRUPTED;
		}

		if (this._disposeFlag) throw DISPOSED;
	}

	_normalize(text, newline = NEWLINE) {
		return text
			.replace(NEWLINE_REGEXP, newline)
			.replace(TABULATION_REGEXP, TABULATION);
	}

	_isValidInput(data) {
		return (
			(data >= String.fromCharCode(0x20) &&
				data <= String.fromCharCode(0x7e)) ||
			data >= "\u00a0"
		);
	}

	_processCommonBrowserKeys(data) {
		if (data === KEY_REFRESH_1 || data === KEY_REFRESH_2) {
			window.location.reload();
			return true;
		}

		if (data === KEY_FULLSCREEN) {
			document.body.requestFullscreen();
			return true;
		}
	}
}
