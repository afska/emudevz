/*import commands from "./commands";*/
import theme from "./theme";

export default class Shell {
	constructor(terminal) {
		this._terminal = terminal;
	}

	async run() {
		this._terminal.writeln("Hi.", theme.SYSTEM);
		this._terminal.writeln("What's your name?");

		let name = null;
		while (name == null) {
			try {
				name = await this._terminal.prompt();
			} catch (e) {}
		}
		this._terminal.writeln("Hi " + name + "!");
		this._terminal.newline();

		this.run();
	}

	onStop() {
		this._terminal.newline();
		this._terminal.writeln("You cannot stop me. I'm the fucking shell!");

		return false;
	}
}
