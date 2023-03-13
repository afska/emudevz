import { LinkProvider } from "xterm-link-provider";
import _ from "lodash";
import locales from "../locales";
import { async, bus } from "../utils";
import { ansiEscapes } from "../utils/cli";
import PendingInput, { PendingKey } from "./PendingInput";
import Shell from "./Shell";
import { CANCELED, DISPOSED, INTERRUPTED } from "./errors";
import highlighter from "./highlighter";
import { theme } from "./style";

const BUS_RUN_SPEED = 30;
const REMOTE_RUN_TIMEOUT = 3000;
const KEY_FULLSCREEN = "[23~";
const KEY_REFRESH_1 = "[15~";
const KEY_REFRESH_2 = "";
const KEY_CTRL_C = "\u0003";
const KEY_BACKSPACE = "\u007F";
const ARGUMENT_SEPARATOR = " ";
const NEWLINE_REGEXP = /\r\n?|\n/g;
const WHITESPACE_REGEXP = /\s/;
const NEWLINE = "\r\n";
const SHORT_NEWLINE = "\n";
const TABULATION_REGEXP = /\t/g;
const TABULATION = "\t";
const INDENTATION = "  ";
const CTRL_C = "^C";
const BACKSPACE = "\b \b";

export default class Terminal {
	constructor(xterm) {
		this._xterm = xterm;
		this._input = null;
		this._keyInput = null;

		this._isWriting = false;
		this._speedFlag = false;
		this._stopFlag = false;
		this._disposeFlag = false;
		this._interceptingKey = undefined;
		this._interceptingCallback = undefined;

		this._shell = new Shell(this);
		this._currentProgram = null;

		this._setUpXtermHooks();
		this._setUpRemoteCommandSubscriber();

		this.autocompleteOptions = [];
	}

	async start(
		title = null,
		subtitle = null,
		availableCommands = [],
		startup = null
	) {
		// (add an extra space after emojis)
		title = title.replace(
			/(<a?:.+?:\d{18}>|\p{Extended_Pictographic}.?) /u,
			"$1  "
		);

		if (title) await this.writeln(title, theme.SYSTEM);
		if (subtitle) await this.writeln(subtitle, theme.COMMENT);
		this._shell.availableCommands = availableCommands;

		if (startup != null) {
			await this.newline();
			this._shell.runLine(startup);
		} else this.restart();
	}

	async run(program) {
		try {
			this._currentProgram = program;
			this.autocompleteOptions = [];
			await this._currentProgram.run();
		} catch (e) {
			if (e === DISPOSED) return;
			throw e;
		}
	}

	restart() {
		this.run(this._shell);
	}

	async writehlln(text, style, interval) {
		await this.writeln(text, style, interval, true);
	}

	async writehl(text, style, interval) {
		await this.write(text, style, interval, true);
	}

	async writeln(text, style, interval, withHighlight) {
		await this.write(text, style, interval, withHighlight);
		await this.newline();
	}

	async write(text, style = theme.NORMAL, interval = 0, withHighlight = false) {
		text = this._normalize(text);

		if (withHighlight) {
			const parts = highlighter.highlightText(text);

			for (let part of parts) {
				if (part.isAccent) await this.write(part.text, part.style, interval);
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
			let lastCharacter = " ";

			for (let i = 0; i < characters.length; i++) {
				this._interruptIfNeeded();

				if (this._needsWordWrap(characters, i, lastCharacter))
					await this.newline();

				lastCharacter = characters[i];
				this._xterm.write(style(lastCharacter));
				await async.sleep(this._speedFlag ? 0 : interval);
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
		styledIndicator = theme.ACCENT(indicator),
		multiLine = false,
		isValid = (x) => x !== ""
	) {
		this.cancelSpeedFlag();
		this._interruptIfNeeded();

		return new Promise(async (resolve, reject) => {
			this._input = new PendingInput(indicator, isValid, resolve, reject);
			this._input.onChange = (text) => this._currentProgram.onInput(text);
			this._input.multiLine = multiLine;
			await this.newline();
			await this.write(styledIndicator);
			await async.sleep();
			const { x, y, ybase } = this.buffer;
			this._input.position.x = x;
			this._input.position.y = y + ybase;
		});
	}

	async addInput(data, runSpeed = 0) {
		if (this.isExpectingInput && this._isValidInput(data)) {
			const isMultiLine = data.split(NEWLINE_REGEXP).length > 1;
			if (isMultiLine && !this._input.multiLine) return;

			await this.write(data, undefined, runSpeed);
			this._input.append(data);
		}
	}

	async confirmPrompt() {
		if (this.isExpectingInput) {
			const input = this._input;
			this._input = null;
			const isValid = input.confirm();

			if (isValid) await this.newline();
		}
	}

	cancelPrompt(reason = CANCELED) {
		if (this.isExpectingInput) {
			const input = this._input;
			this._input = null;
			input.cancel(reason);
		}
	}

	cancelKey(reason = CANCELED) {
		if (this.isExpectingKey) {
			const keyInput = this._keyInput;
			this._keyInput = null;
			keyInput.reject(reason);
		}
	}

	async interrupt() {
		const wasExpectingInput = this.isExpectingInput;
		const wasExpectingKey = this.isExpectingKey;

		const isShell = this._currentProgram.isShell;

		if (this._currentProgram.onStop()) {
			this.cancelPrompt(INTERRUPTED);
			this.cancelKey(INTERRUPTED);
			await this.break();
			if (!isShell) await this.newline();
			if (!wasExpectingInput && !wasExpectingKey) this._requestInterrupt();
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
		this._subscriber.release();
	}

	get isExpectingInput() {
		return this._input != null;
	}

	get isExpectingKey() {
		return this._keyInput != null;
	}

	get hasPendingInput() {
		return this.isExpectingInput && this._input.text.length > 0;
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
		if (this._processCommonKeys(data)) return;
		data = this._normalize(data, SHORT_NEWLINE);

		switch (data) {
			case KEY_CTRL_C: {
				await this.interrupt();
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

				await this.addInput(data);
				await this._currentProgram.onData(data);
			}
		}
	}

	async _onKey(e) {
		const isKeyDown = e.type === "keydown";
		const isEnter = e.key === "Enter";
		const isCtrlShiftC = e.ctrlKey && e.shiftKey && e.key === "C";
		const isShiftEnter = e.shiftKey && isEnter;

		if (e.key === "Tab" && this._currentProgram.usesAutocomplete()) {
			this._interceptingKey = TABULATION;
			this._interceptingCallback = () => this._processAutocomplete();
			return;
		}

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
			await this.write(
				NEWLINE + "⚠️  " + locales.get("resize_warning"),
				theme.ACCENT
			);
			this.cancelPrompt();
		}
	}

	_setUpXtermHooks() {
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

	_setUpRemoteCommandSubscriber() {
		this._subscriber = bus.subscribe({
			run: async (commandLine) => {
				if (this._isWritingRemoteCommand) return;

				try {
					this._isWritingRemoteCommand = true;
					await this.interrupt();
					await async.sleep();
					while (this._stopFlag) await async.sleep();
					let wait = 0;
					while (!this._currentProgram.isShell) {
						await async.sleep();
						wait++;
						if (wait > REMOTE_RUN_TIMEOUT) break;
					}
					if (wait <= REMOTE_RUN_TIMEOUT) {
						await this.addInput(commandLine, BUS_RUN_SPEED);
						await this.confirmPrompt();
					}
				} finally {
					this._isWritingRemoteCommand = false;
				}
			},
			kill: async () => {
				await this.interrupt();
			},
		});
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

	_needsWordWrap(characters, i, lastCharacter) {
		if (WHITESPACE_REGEXP.test(lastCharacter)) {
			const remainingCharacters = characters.slice(i);
			let nextWordLength = _.findIndex(remainingCharacters, (it) =>
				WHITESPACE_REGEXP.test(it)
			);
			if (nextWordLength === -1) nextWordLength = remainingCharacters.length;

			return this.buffer.x + nextWordLength > this.width;
		}

		return false;
	}

	_normalize(text, newline = NEWLINE) {
		return text
			.replace(NEWLINE_REGEXP, newline)
			.replace(TABULATION_REGEXP, INDENTATION);
	}

	_isValidInput(data) {
		return (
			(data >= String.fromCharCode(0x20) &&
				data <= String.fromCharCode(0x7e)) ||
			data >= "\u00a0"
		);
	}

	async _processAutocomplete() {
		if (!this.isExpectingInput || this._input.isEmpty()) return;

		const text = this._input.text;
		const lastPart = _.last(text.split(ARGUMENT_SEPARATOR));
		const options = this.autocompleteOptions.filter((it) =>
			it.startsWith(lastPart)
		);

		if (options.length === 1) {
			const autocompletedCharacters = options[0].replace(lastPart, "");
			this._onData(autocompletedCharacters);
		} else if (options.length > 1) {
			let commonCharacters = "";
			const tmp = { index: 0 };
			while (options.every((it) => it[tmp.index] === options[0][tmp.index])) {
				commonCharacters += options[0][tmp.index];
				tmp.index++;
			}
			const autocompletedCharacters = commonCharacters.replace(lastPart, "");

			await this.write(NEWLINE + options.join(INDENTATION), theme.MESSAGE);
			this.cancelPrompt();
			await async.sleep();
			this._onData(text + autocompletedCharacters);
		}
	}

	_processCommonKeys(data) {
		if (data === this._interceptingKey) {
			this._interceptingCallback();
			this._interceptingKey = undefined;
			this._interceptingCallback = undefined;
			return true;
		}

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
