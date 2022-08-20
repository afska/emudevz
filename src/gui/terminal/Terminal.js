import Shell from "./Shell";
import PendingInput from "./PendingInput";
import theme from "./theme";

const KEY_CTRL_C = "\u0003";
const KEY_BACKSPACE = "\u007F";
const KEY_ENTER = "\r";
const NEWLINE = "\r\n";
const CTRL_C = "^C";
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

	writeln(text, style = theme.NORMAL) {
		this._xterm.writeln(style(text));
	}

	write(text, style = theme.NORMAL) {
		this._xterm.write(style(text));
	}

	newline() {
		this.write(NEWLINE);
	}

	prompt() {
		return new Promise((resolve, reject) => {
			this._input = new PendingInput(resolve, reject);
			this.newline();
			this.write(PROMPT);
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
				if (this.cancelPrompt()) {
					this.write(CTRL_C);
					this.newline();
				}
				this._currentProgram.onStop();
				break;
			}
			case KEY_ENTER: {
				if (this.confirmPrompt()) this.newline();

				break;
			}
			case KEY_BACKSPACE:
				if (this._xterm._core.buffer.x > PROMPT.length) {
					this.write(BACKSPACE);
					if (this._input != null) this._input.backspace();
				}
				break;
			default:
				if (this._input != null && this._isValidInput(data)) {
					this._input.append(data);
					this.write(data);
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
