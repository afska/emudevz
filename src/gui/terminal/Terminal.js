import Shell from "./Shell";
import PendingInput from "./PendingInput";
import locales from "../locales";
import theme from "./theme";
import { async } from "../utils";

const KEY_CTRL_C = "\u0003";
const KEY_BACKSPACE = "\u007F";
const KEY_ENTER = "\r";
const NEWLINE = "\r\n";
const CTRL_C = "^C";
const BACKSPACE = "\b \b";
const PROMPT = "$ ";

// Program interface:
// - async run(args) -> void
// - onStop() -> Boolean

export default class Terminal {
	constructor(xterm) {
		this._xterm = xterm;
		this._input = null;

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
			this._xterm.write(style(text));
		} else {
			const characters = [...text];

			for (let i = 0; i < characters.length; i++) {
				this._xterm.write(style(characters[i]));
				await async.sleep(interval);
			}
		}
	}

	async newline() {
		await this.write(NEWLINE);
	}

	prompt() {
		return new Promise((resolve, reject) => {
			this._input = new PendingInput(resolve, reject);
			this.newline().then(() => this.write(PROMPT, theme.ACCENT));
		});
	}

	confirmPrompt() {
		if (this._input != null) {
			const isConfirmed = this._input.confirm();
			this._input = null;

			return isConfirmed;
		}

		return false;
	}

	cancelPrompt() {
		if (this._input != null) {
			this._input.cancel();
			this._input = null;

			return true;
		}

		return false;
	}

	clear() {
		this._xterm.clear();
	}

	async _onData(data) {
		switch (data) {
			case KEY_CTRL_C: {
				if (this.cancelPrompt()) await this.write(CTRL_C);
				if (this._currentProgram.onStop()) this.restart();

				break;
			}
			case KEY_ENTER: {
				if (this.confirmPrompt()) await this.newline();

				break;
			}
			case KEY_BACKSPACE:
				if (this._xterm._core.buffer.x > PROMPT.length) {
					await this.write(BACKSPACE);
					if (this._input != null) this._input.backspace();
				}
				break;
			default:
				if (this._input != null && this._isValidInput(data)) {
					this._input.append(data);
					await this.write(data);
				}
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
