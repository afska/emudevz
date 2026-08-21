import GraphemeSplitter from "grapheme-splitter";
import _ from "lodash";
import filesystem from "../filesystem";
import _links from "../gui/_links";
import { sfx } from "../gui/sound";
import Level from "../level/Level";
import locales from "../locales";
import { getAdvancedSetting } from "../models/savedata";
import store from "../store";
import { async, bus, dlc, toast } from "../utils";
import { addSpaceAfterEmoji, ansiEscapes } from "../utils/cli";
import { WebLinkProvider } from "../utils/cli/WebLinkProvider";
import PendingInput, { PendingKey } from "./PendingInput";
import Shell from "./Shell";
import FilesystemCommand from "./commands/fs/FilesystemCommand";
import OpenCommand, {
	ERR_CANNOT_LAUNCH_EMULATOR,
	ERR_CANNOT_OPEN_FILE,
	ERR_FILE_NOT_FOUND,
} from "./commands/fs/OpenCommand";
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
const KEY_LEFT = "\u001b[D";
const KEY_RIGHT = "\u001b[C";
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
const LINK_FILE_REGEXP = /📄 {2}([a-z0-9/._-]+)/iu;

window._openPath_ = (filePath) => {
	const result = OpenCommand.open(filePath);
	if (result === ERR_FILE_NOT_FOUND) {
		toast.error(
			<span
				onClick={() => {
					Terminal.tryCreateFile(filePath);
				}}
			>
				<span className="toast-link">
					{locales.get("file_doesnt_exist1")} <code>{filePath}</code>{" "}
					{locales.get("file_doesnt_exist2")}
				</span>
			</span>
		);
	} else if (result === ERR_CANNOT_LAUNCH_EMULATOR) {
		toast.error(locales.get("cant_open_emulator"));
	} else if (result === ERR_CANNOT_OPEN_FILE) {
		toast.error(locales.get("cant_open_file"));
	} else {
		return true;
	}

	return false;
};

export default class Terminal {
	constructor(xterm, dictionary) {
		// HACK: Disabling mobile keyboard
		document
			.querySelectorAll("textarea.xterm-helper-textarea")
			.forEach((el) => {
				el.setAttribute("virtualkeyboardpolicy", "manual");
				el.setAttribute("readonly", "");
			});

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
		this._setUpFileLinks();
		if (dictionary != null) this._setUpDictionaryLinks(dictionary);

		this.autocompleteOptions = [];
		this._splitter = new GraphemeSplitter();
	}

	async start(
		title = null,
		subtitle = null,
		availableCommands = [],
		startup = null,
		links = null
	) {
		title = addSpaceAfterEmoji(title);

		if (title) await this.writeln(title, theme.SYSTEM);
		if (subtitle) await this.writeln(subtitle, theme.COMMENT);
		if (window.ROOT_USER) {
			await this.newline();
			await this.writehlln(locales.get("root_enabled"), theme.WARNING);
		}

		this._shell.availableCommands = availableCommands;

		if (startup != null) {
			await this.newline();
			this._shell.runLine(startup);
		} else this.restart();

		if (links != null) this._setUpTextLinks(links);
	}

	async run(program) {
		try {
			this._currentProgram = program;
			this.autocompleteOptions = [];
			const exitCode = await this._currentProgram.run();

			if (!exitCode) sfx.play("close");
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
		if (store.getState().savedata.chatSpeed === "fast") this._speedFlag = true;

		text = this._normalize(text);

		if (withHighlight) {
			const parts = highlighter.highlightText(
				text,
				this._dictionaryLinkProvider?.regexp,
				this._textLinkProvider?.regexp
			);

			for (let part of parts) {
				if (part.text == null) continue;

				if (part.isAccent) await this.write(part.text, part.style, interval);
				else if (part.isCode) await this.write(part.text, part.style);
				else await this.write(part.text, style, interval);
			}

			return;
		}

		this._isWriting = true;

		if (interval === 0) {
			this._interruptIfNeeded();
			this._xterm.write(style(text));
		} else {
			const characters = this._splitter.splitGraphemes(text);
			let lastCharacter = " ";

			await async.sleep();
			for (let i = 0; i < characters.length; i++) {
				this._interruptIfNeeded();

				const isSpecialMarker = style === theme.DICTIONARY;

				if (
					!isSpecialMarker &&
					this._needsWordWrap(characters, i, lastCharacter)
				)
					await this.newline();

				lastCharacter = characters[i];
				this._xterm.write(style(lastCharacter));

				if (!hasInstantChat())
					await async.sleep(this._speedFlag ? 0 : interval);
			}
		}

		this._isWriting = false;
	}

	async break() {
		await this.write(CTRL_C, theme.BG_HIGHLIGHT_END);
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
			if (this._input == null) return;
			const { x, y, ybase } = this.buffer;
			this._input.position.x = x;
			this._input.position.y = y + ybase;
		});
	}

	async addInput(data, runSpeed = 0) {
		if (this.isExpectingInput && this._isValidInput(data)) {
			const isMultiLine = data.split(NEWLINE_REGEXP).length > 1;
			if (isMultiLine && !this._input.multiLine) return;

			if (this._input.caretIndex === this._input.text.length) {
				await this.write(data, undefined, runSpeed);
				this._input.append(data);
				this._updateRenderedRows();
				if (await this._cancelPromptIfTooTall()) return;
			} else {
				this._input.insertAtCaret(data);
				await this._redrawInput();
			}
		}
	}

	async confirmPrompt() {
		if (!this.isExpectingInput) return;

		const input = this._input;
		this._input = null;

		if (input.multiLine) await this.write(this._cursorToInputEndSeq(input));

		const isValid = input.confirm();
		input.caretIndex = 0;

		if (isValid) await this.newline();
		this._xterm.scrollToBottom();
	}

	async cancelPrompt(reason = CANCELED, warning = null) {
		if (!this.isExpectingInput) return;

		const input = this._input;
		this._input = null;

		if (input.multiLine) await this.write(this._cursorToInputEndSeq(input));

		if (warning != null)
			await this.write(NEWLINE + "⚠️  " + warning, theme.ACCENT);

		input.cancel(reason);
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
			await this.cancelPrompt(INTERRUPTED);
			this.cancelKey(INTERRUPTED);
			await this.break();
			if (!isShell) await this.newline();
			if (!wasExpectingInput && !wasExpectingKey) this._requestInterrupt();
		}
	}

	async clearInput() {
		if (!this.isExpectingInput) return;

		const input = this._input;
		const { x, y, ybase } = this.buffer;
		const currentAbsoluteY = y + ybase;
		const startAbsoluteY = input.position.y;
		const startColumn = input.position.x;

		const linesSpanned = Math.max(0, currentAbsoluteY - startAbsoluteY) + 1;

		let sequence = "";

		// move to the beginning of the input (after the prompt indicator)
		if (currentAbsoluteY > startAbsoluteY)
			sequence += ansiEscapes.cursorMove(
				0,
				-(currentAbsoluteY - startAbsoluteY)
			);
		sequence += ansiEscapes.cursorTo(startColumn);
		sequence += ansiEscapes.eraseEndLine;

		// clear any wrapped or multi-line input lines below
		for (let i = 1; i < linesSpanned; i++) {
			sequence += ansiEscapes.cursorDown();
			sequence += ansiEscapes.cursorTo(0);
			sequence += ansiEscapes.eraseEndLine;
		}

		// return cursor to the original input start position
		if (linesSpanned > 1) {
			sequence += ansiEscapes.cursorMove(0, -(linesSpanned - 1));
			sequence += ansiEscapes.cursorTo(startColumn);
		}

		await this.write(sequence);
		input.text = "";
		input.caretIndex = 0;
	}

	async backspace() {
		await async.sleep();
		if (this.isExpectingInput) {
			if (this._input.caretIndex < this._input.text.length) {
				this._input.deleteBackwardAtCaret();
				await this._redrawInput();
				return;
			}

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
				this._input.caretIndex = this._input.text.length;
				this._updateRenderedRows();
			} else {
				const newLine = absY - 1;
				const indicatorOffset = this._input.getIndicatorOffset(newLine);
				const lineLength = Math.min(
					this._input.getLineLength(newLine, this.width) + indicatorOffset,
					this.width
				);
				const character = this._input.backspace();
				this._input.caretIndex = this._input.text.length;
				this._updateRenderedRows();

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

	registerLinkProvider(regexp, callback, options = {}) {
		return this._xterm.registerLinkProvider(
			new WebLinkProvider(this._xterm, regexp, callback, options)
		);
	}

	tryInterrupt() {
		if (this._stopFlag) {
			this._stopFlag = false;
			return INTERRUPTED;
		}

		if (this._disposeFlag) return DISPOSED;
		return null;
	}

	clear() {
		this._xterm.clear();
	}

	dispose() {
		this._disposeFlag = true;
		this._subscriber.release();
		this._fileLinkProvider.dispose();
		if (this._dictionaryLinkProvider != null)
			this._dictionaryLinkProvider.dispose();
		if (this._textLinkProvider != null) this._textLinkProvider.dispose();
	}

	static tryCreateFile(filePath, initialContent = "") {
		try {
			const resolvedFilePath = FilesystemCommand.resolve(filePath, true);
			filesystem.write(resolvedFilePath, initialContent, { parents: true });
			OpenCommand.open(filePath);
			toast.success(locales.get("file_created"));
			sfx.play("save");
		} catch (e) {
			toast.error(locales.get("file_created_error"));
		}
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

		if (data === KEY_CTRL_C) {
			await this.interrupt();
			return;
		}

		if (this.isExpectingKey) {
			this._keyInput.resolve(data);
			this._keyInput = null;
			return;
		}

		switch (data) {
			case KEY_BACKSPACE: {
				await this.backspace();
				break;
			}
			case KEY_LEFT: {
				if (this.isExpectingInput && this._input.caretIndex > 0) {
					this._input.caretIndex -= 1;
					await this._redrawInput();
				}
				break;
			}
			case KEY_RIGHT: {
				if (
					this.isExpectingInput &&
					this._input.caretIndex < this._input.text.length
				) {
					this._input.caretIndex += 1;
					await this._redrawInput();
				}
				break;
			}
			default: {
				await this.addInput(data);
				await this._currentProgram.onData(data);
			}
		}
	}

	_onKey(e) {
		const isKeyDown = e.type === "keydown";
		if (!isKeyDown) return true;

		const isEnter = e.key === "Enter";
		const isTab = e.key === "Tab";
		const isCtrlShiftC = e.ctrlKey && e.shiftKey && e.key === "C";
		const isShiftEnter = e.shiftKey && isEnter;

		if (this.isExpectingKey && (isEnter || isTab)) return true;

		// ctrl+arrows / ctrl+backspace / ctrl+delete
		if (this.isExpectingInput && e.ctrlKey && !e.shiftKey && !e.altKey) {
			if (e.key === "ArrowLeft") {
				this._moveCaretWord(-1);
				e.preventDefault();
				return false;
			}
			if (e.key === "ArrowRight") {
				this._moveCaretWord(+1);
				e.preventDefault();
				return false;
			}
			if (e.key === "Backspace") {
				this._deleteWord(-1);
				e.preventDefault();
				return false;
			}
			if (e.key === "Delete") {
				this._deleteWord(+1);
				e.preventDefault();
				return false;
			}
		}

		// delete (delete char at caret)
		if (this.isExpectingInput && !e.ctrlKey && !e.shiftKey && !e.altKey) {
			if (e.key === "Delete") {
				this._deleteForward();
				e.preventDefault();
				return false;
			}
		}

		// tab (autocomplete)
		if (isTab && this._currentProgram.usesAutocomplete()) {
			this._interceptingKey = TABULATION;
			this._interceptingCallback = () => this._processAutocomplete();
			return true;
		}

		// ctrl+shift+c (copy)
		if (isCtrlShiftC) {
			const selection = this._xterm.getSelection();
			navigator.clipboard.writeText(selection);
			e.preventDefault();
			return false;
		}

		if (isEnter) {
			(async () => {
				if (isShiftEnter && this.isExpectingInput && this._input.multiLine) {
					// shift+enter (new line)
					if (this._input.caretIndex === this._input.text.length) {
						await this.newline();
						this._input.append(SHORT_NEWLINE);
						this._updateRenderedRows();
						if (await this._cancelPromptIfTooTall()) return;
					} else {
						this._input.insertAtCaret(SHORT_NEWLINE);
						await this._redrawInput();
					}
					this._xterm.scrollToBottom();
				} else {
					// enter (execute)
					if (this._isWriting) this._speedFlag = true;
					await this.confirmPrompt();
				}
			})();
			e.preventDefault();
			return false;
		}

		return true;
	}

	async _onResize(e) {
		if (this.isExpectingInput && this._input.text !== "")
			await this.cancelPrompt(CANCELED, locales.get("resize_warning"));
	}

	_setUpXtermHooks() {
		this._xterm.onData((data) => {
			this._onData(data);
		});
		this._xterm.attachCustomKeyEventHandler((e) => {
			return this._onKey(e);
		});
		this._xterm.onResize((e) => {
			this._onResize(e);
		});
	}

	_setUpRemoteCommandSubscriber() {
		this._subscriber = bus.subscribe({
			run: async (commandLine) => {
				if (this._isWritingRemoteCommand) return;

				bus.emit("unpin", { changeFocus: false });
				this._xterm.scrollToBottom();

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
						this.clear();
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

	_setUpFileLinks() {
		this._fileLinkProvider = this.registerLinkProvider(
			LINK_FILE_REGEXP,
			(__, link) => {
				const matches = link.match(LINK_FILE_REGEXP);
				const filePath = matches[1];
				window._openPath_(filePath);
			}
		);
	}

	_setUpDictionaryLinks(dictionary) {
		const regexp = dictionary.getRegexp();
		const handler = (__, word) => {
			dictionary.showDefinition(word);
		};
		this._dictionaryLinkProvider = this.registerLinkProvider(regexp, handler, {
			ignore: /^\d\d?\) /,
		});
		this._dictionaryLinkProvider.regexp = regexp;
	}

	_setUpTextLinks(links) {
		const linkTexts = links.map((link) => link.text);
		const regexp = new RegExp(`(${linkTexts.join("|")})`, "iu");

		const handler = (__, match) => {
			const link = links.find((link) => link.text === match);

			if (link.isSupport) {
				if (window.EmuDevz.isDesktop()) {
					if (dlc.installed()) {
						window.open(_links.rlabs);
					} else {
						window.steam.openDlcStore().catch(() => {
							window.open(_links.rlabs);
						});
					}
				} else {
					window.open(_links.coffee);
				}
				return;
			}

			if (link) window.open(link.href);
		};

		this._textLinkProvider = this.registerLinkProvider(regexp, handler, {
			ignore: /^\d\d?\) /,
		});
		this._textLinkProvider.regexp = regexp;
	}

	_requestInterrupt() {
		this._stopFlag = true;
	}

	_interruptIfNeeded() {
		const interrupt = this.tryInterrupt();
		if (interrupt != null) throw interrupt;
	}

	_needsWordWrap(characters, i, lastCharacter) {
		if (hasInstantChat()) return false;

		if (WHITESPACE_REGEXP.test(lastCharacter)) {
			const remainingCharacters = characters.slice(i);
			let nextWordLength = _.findIndex(remainingCharacters, (it) =>
				WHITESPACE_REGEXP.test(it)
			);
			if (nextWordLength === -1) nextWordLength = remainingCharacters.length;

			return (
				characters[0] !== "/" && this.buffer.x + nextWordLength > this.width - 1
			);
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

		if (this._input.caretIndex < this._input.text.length) {
			this._input.caretIndex = this._input.text.length;
			await this._redrawInput();
		}

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
			await this.cancelPrompt();
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

		if (data === KEY_FULLSCREEN && !window.EmuDevz.isDesktop()) {
			document.body.requestFullscreen();
			return true;
		}

		if (data === KEY_LEFT || data === KEY_RIGHT) return false;
	}

	async _cancelPromptIfTooTall() {
		if (!this.isExpectingInput) return false;

		const input = this._input;
		const rows = Math.max(1, input.renderedRows || 1);

		if (rows <= this.height) return false;

		this.cancelPrompt(CANCELED, locales.get("prompt_too_long"));
		return true;
	}

	async _redrawInput() {
		if (!this.isExpectingInput) return;

		const input = this._input;
		const { y, ybase } = this.buffer;
		const currentAbsoluteY = y + ybase;
		const startAbsoluteY = input.position.y;
		const startColumn = input.position.x;

		const previousRows = Math.max(1, input.renderedRows || 1);

		let sequence = "";
		// move to input start
		if (currentAbsoluteY > startAbsoluteY)
			sequence += ansiEscapes.cursorMove(
				0,
				-(currentAbsoluteY - startAbsoluteY)
			);
		sequence += ansiEscapes.cursorTo(startColumn);
		sequence += ansiEscapes.eraseEndLine;
		for (let i = 1; i < previousRows; i++) {
			sequence += ansiEscapes.cursorDown();
			sequence += ansiEscapes.cursorTo(0);
			sequence += ansiEscapes.eraseEndLine;
		}
		if (previousRows > 1) {
			sequence += ansiEscapes.cursorMove(0, -(previousRows - 1));
			sequence += ansiEscapes.cursorTo(startColumn);
		}

		await this.write(sequence);
		await this.write(input.text);

		// update rendered rows and position cursor at caret
		const endPos = this._computePositionAfterText(input.text, startColumn);
		const caretText = input.text.substring(0, input.caretIndex);
		const caretPos = this._computePositionAfterText(caretText, startColumn);

		input.renderedRows = endPos.rowsDown + 1;

		if (await this._cancelPromptIfTooTall()) return;

		let moveSeq = "";
		const rowsUp = endPos.rowsDown - caretPos.rowsDown;
		if (rowsUp > 0) moveSeq += ansiEscapes.cursorUp(rowsUp);
		else if (rowsUp < 0) moveSeq += ansiEscapes.cursorDown(-rowsUp);
		const horizontal = caretPos.column - endPos.column;
		if (horizontal !== 0) moveSeq += ansiEscapes.cursorMove(horizontal, 0);
		if (moveSeq) await this.write(moveSeq);
	}

	_computePositionAfterText(text, startColumn) {
		let column = startColumn;
		let rowsDown = 0;

		const getCellWidth = // HACK: Accessing xterm.js private API!
			this._xterm._core?.unicodeService?.getStringCellWidth?.bind(
				this._xterm._core.unicodeService
			) ?? ((s) => s.length);

		const graphemes = this._splitter.splitGraphemes(text);

		for (let g of graphemes) {
			if (g === SHORT_NEWLINE) {
				rowsDown += 1;
				column = 0;
				continue;
			}

			const w = getCellWidth(g) || 0;

			if (w > 0 && column + w > this.width) {
				rowsDown += 1;
				column = 0;
			}

			column += w;

			if (column >= this.width) {
				column = 0;
				rowsDown += 1;
			}
		}

		return { rowsDown, column };
	}

	_updateRenderedRows() {
		if (!this.isExpectingInput) return;

		const startColumn = this._input.position.x;
		const endPos = this._computePositionAfterText(
			this._input.text,
			startColumn
		);
		this._input.renderedRows = endPos.rowsDown + 1;
	}

	_cursorToInputEndSeq(input) {
		const { y, ybase } = this.buffer;
		const curAbsY = y + ybase;

		const startCol = input.position.x;
		const end = this._computePositionAfterText(input.text, startCol);
		const endAbsY = input.position.y + end.rowsDown;

		return (
			ansiEscapes.cursorMove(0, endAbsY - curAbsY) +
			ansiEscapes.cursorTo(end.column)
		);
	}

	async _deleteForward() {
		if (!this.isExpectingInput) return;

		const input = this._input;
		const i = input.caretIndex;
		if (i >= input.text.length) return;

		input.text = input.text.substring(0, i) + input.text.substring(i + 1);
		await this._redrawInput();
	}

	async _moveCaretWord(dir) {
		if (!this.isExpectingInput) return;

		const input = this._input;
		const next = this._wordBoundary(input.text, input.caretIndex, dir);
		if (next === input.caretIndex) return;

		input.caretIndex = next;
		await this._redrawInput();
	}

	async _deleteWord(dir) {
		if (!this.isExpectingInput) return;

		const input = this._input;
		const text = input.text;
		const i = input.caretIndex;

		const j = this._wordBoundary(text, i, dir);
		if (j === i) return;

		const start = Math.min(i, j);
		const end = Math.max(i, j);

		input.text = text.substring(0, start) + text.substring(end);
		input.caretIndex = start;
		await this._redrawInput();
	}

	_stepWhile(text, i, dir, predicate) {
		while (
			(dir < 0 ? i > 0 : i < text.length) &&
			predicate(dir < 0 ? text[i - 1] : text[i])
		)
			i += dir;

		return i;
	}

	_wordBoundary(text, i, dir) {
		i = this._stepWhile(text, i, dir, (ch) => WHITESPACE_REGEXP.test(ch)); // skip spaces
		i = this._stepWhile(text, i, dir, (ch) => !WHITESPACE_REGEXP.test(ch)); // skip word
		return i;
	}
}

function hasInstantChat() {
	return (
		getAdvancedSetting((obj) => obj.chat?.instant) ||
		Level.current.memory.chat.instant
	);
}
