import { LinkProvider } from "xterm-link-provider";
import { async } from "../utils";
import PendingInput from "./PendingInput";
import Shell from "./Shell";
import { theme } from "./style";

const KEY_FULLSCREEN = "[23~";
const KEY_REFRESH_1 = "[15~";
const KEY_REFRESH_2 = "";
const KEY_CTRL_C = "\u0003";
const KEY_BACKSPACE = "\u007F";
const KEY_ENTER = "\r";
const NEWLINE = "\r\n";
const TABULATION = "  ";
const CTRL_C = "^C";
const BACKSPACE = "\b \b";
const CANCELED = "canceled";
const INTERRUPTED = "interrupted";

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

		this._shell = new Shell(this);
		this._currentProgram = null;

		this._xterm.onData((e) => {
			this._onData(e);
		});
	}

	async start(welcomeMessage, availableCommands = [], startup = null) {
		await this.writeln(welcomeMessage, theme.SYSTEM);
		this._shell.availableCommands = availableCommands;

		if (startup != null) {
			await this.newline();
			this._shell.runLine(startup);
		} else this.restart();
	}

	async run(program) {
		this._currentProgram = program;
		await this._currentProgram.run();
	}

	async restart() {
		await this.run(this._shell);
	}

	async writeln(text, style, interval) {
		await this.write(text, style, interval);
		await this.newline();
	}

	async write(text, style = theme.NORMAL, interval = 0) {
		this._isWriting = true;

		text = text.replace(/\n/g, NEWLINE).replace(/\t/g, TABULATION);

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
		return new Promise((resolve) => {
			this._keyInput = resolve;
		});
	}

	prompt(indicator = "$ ", style = theme.ACCENT, isValid = (x) => x !== "") {
		this.cancelSpeedFlag();
		this._interruptIfNeeded();

		return new Promise((resolve, reject) => {
			this._input = new PendingInput(indicator, isValid, resolve, reject);
			this.newline().then(() => this.write(indicator, style));
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

	async clearInput() {
		while (!this._input.isEmpty()) await this.backspace();
	}

	async backspace() {
		if (
			this.isExpectingInput &&
			this._xterm._core.buffer.x > this._input.indicator.length
		) {
			await this.write(BACKSPACE);
			this._input.backspace();
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

	get isExpectingInput() {
		return this._input != null;
	}

	async _onData(data) {
		if (this._processCommonBrowserKeys(data)) return;

		if (this._keyInput) {
			this._keyInput();
			this._keyInput = null;
		}

		switch (data) {
			case KEY_CTRL_C: {
				const wasExpectingInput = this.isExpectingInput;

				if (this._currentProgram.onStop()) {
					this.cancelPrompt(INTERRUPTED);
					await this.break();
					await this.newline();
					if (!wasExpectingInput) this._requestInterrupt();
				}

				break;
			}
			case KEY_ENTER: {
				if (this._isWriting) this._speedFlag = true;
				await this.confirmPrompt();

				break;
			}
			case KEY_BACKSPACE: {
				await this.backspace();
				break;
			}
			default: {
				if (this.isExpectingInput && this._isValidInput(data)) {
					this._input.append(data);
					await this.write(data);
				}
			}
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
