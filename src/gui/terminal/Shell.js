import commands from "./commands";
import theme from "./theme";

export default class Shell {
	constructor(terminal) {
		this._terminal = terminal;
	}

	async run() {
		this._terminal.writeln("Hi.", theme.SYSTEM);
		this._terminal.writeln("What's your name?");

		const nombre = await this._terminal.prompt();
		this._terminal.writeln("Hi " + nombre + "!");
		this._terminal.newline();

		this.run();
	}

	onStop() {
		this._terminal.writeln("You cannot stop me. I'm the fucking shell!");
	}
}
