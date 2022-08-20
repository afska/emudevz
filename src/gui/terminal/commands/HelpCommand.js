import Command from "./Command";
import commands from ".";

export default class HelpCommand extends Command {
	static get name() {
		return "help";
	}

	async execute(args) {
		this._terminal.writeln("Ayudín!");
	}
}
