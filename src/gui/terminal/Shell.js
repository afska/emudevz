import commands from "./commands";

export default class Shell {
	constructor(terminal) {
		this._terminal = terminal;
	}

	async run() {
		this._terminal.writeln("Hi.");
		this._terminal.writeln("What's your name?");

		const nombre = await this._terminal.prompt();
		this._terminal.writeln("Hi " + nombre + "!");

		// this.run();
	}

	onStop() {
		this._terminal.writeln("You cannot stop me. I'm the fucking shell!");
	}
}
