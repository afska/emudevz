import Shell from "./Shell";
import PendingInput from "./PendingInput";

const KEY_CTRL_C = "\u0003";
const KEY_BACKSPACE = "\u007F";
const KEY_ENTER = "\r";
const NEWLINE = "\r\n";
const BACKSPACE = "\b \b";
const PROMPT = "$ ";

export default class Terminal {
	constructor(xterm) {
		this._xterm = xterm;
		this._input = null;

		this._shell = new Shell(this);
		this._currentProgram = this._shell;
	}

	start() {
		this._currentProgram.run();

		this._xterm.onData((e) => {
			this._onData(e);
		});

		return this;
	}

	writeln(text, style = this.styles.NORMAL) {
		this._xterm.writeln(style(text));
	}

	prompt() {
		return new Promise((resolve, reject) => {
			this._input = new PendingInput(resolve, reject);
			this._xterm.write(NEWLINE + PROMPT);
		});
	}

	confirmPrompt() {
		if (this._input != null) {
			this._input.confirm();
			this._input = null;

			return true;
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

	_onData(data) {
		switch (data) {
			case KEY_CTRL_C: {
				this.cancelPrompt();
				this._currentProgram.onStop();
				break;
			}
			case KEY_ENTER: {
				if (this.confirmPrompt()) this._xterm.writeln(NEWLINE);

				break;
			}
			case KEY_BACKSPACE:
				if (this._xterm._core.buffer.x > PROMPT.length) {
					this._xterm.write(BACKSPACE);
					if (this._input != null) this._input.backspace();
				}
				break;
			default:
				if (this._input != null && this._isValidInput(data)) {
					this._input.append(data);
					this._xterm.write(data);
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

	styles = {
		NORMAL: (x) => x,
	};
}
