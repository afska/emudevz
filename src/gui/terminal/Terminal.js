import Shell from "./Shell";
import PendingInput from "./PendingInput";
import locales from "../locales";
import { theme } from "./style";
import { async } from "../utils";

const KEY_CTRL_C = "\u0003";
const KEY_BACKSPACE = "\u007F";
const KEY_ENTER = "\r";
const NEWLINE = "\r\n";
const CTRL_C = "^C";
const BACKSPACE = "\b \b";
const INTERRUPTED = "interrupted";

// Program interface:
// - async run(args) -> void
// - onStop() -> Boolean

export default class Terminal {
	constructor(xterm) {
		this._xterm = xterm;
		this._input = null;
		this._stopFlag = false;

		this._shell = new Shell(this);
		this._currentProgram = null;
	}

	async start() {
		await this.writeln(locales.get("terminal_welcome"), theme.SYSTEM);
		this.restart();

		this._xterm.onData((e) => {
			this._onData(e);
		});

		return this;
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
		if (interval === 0) {
			this._interruptIfNeeded();
			this._xterm.write(style(text));
		} else {
			const characters = [...text];

			for (let i = 0; i < characters.length; i++) {
				this._interruptIfNeeded();

				this._xterm.write(style(characters[i]));
				await async.sleep(interval);
			}
		}
	}

	async newline() {
		await this.write(NEWLINE);
	}

	prompt(indicator = "$ ", style = theme.ACCENT) {
		this._interruptIfNeeded();

		return new Promise((resolve, reject) => {
			this._input = new PendingInput(indicator, resolve, reject);
			this.newline().then(() => this.write(indicator, style));
		});
	}

	async confirmPrompt() {
		if (this._input != null) {
			const text = this._input.confirm();
			this._input = null;

			if (text.length > 0) await this.newline();
		}
	}

	cancelPrompt() {
		if (this._input != null) {
			this._input.cancel(INTERRUPTED);
			this._input = null;
		}
	}

	clear() {
		this._xterm.clear();
	}

	async _onData(data) {
		switch (data) {
			case KEY_CTRL_C: {
				const wasExpectingInput = this._input != null;
				this.cancelPrompt();

				await this.write(CTRL_C);
				if (this._currentProgram.onStop()) {
					await this.newline();
					if (!wasExpectingInput) this._requestInterrupt();
				}

				break;
			}
			case KEY_ENTER: {
				await this.confirmPrompt();

				break;
			}
			case KEY_BACKSPACE: {
				if (
					this._input != null &&
					this._xterm._core.buffer.x > this._input.indicator.length
				) {
					await this.write(BACKSPACE);
					this._input.backspace();
				}
				break;
			}
			default: {
				if (this._input != null && this._isValidInput(data)) {
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
				data <= String.fromCharCode(0x7b)) ||
			data >= "\u00a0"
		);
	}
}
