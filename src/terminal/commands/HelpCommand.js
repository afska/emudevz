import { theme } from "../style";
import commands from ".";
import Command from "./Command";

const NEWLINE = "\r\n";
const SPACING = 10;

export default class HelpCommand extends Command {
	static get name() {
		return "help";
	}

	async execute() {
		await this._terminal.writeln(
			commands
				.filter((it) => this._shell.availableCommands.includes(it.name))
				.map(
					(it) => it.name.padEnd(SPACING) + theme.ACCENT(":: ") + it.description
				)
				.join(NEWLINE)
		);
	}
}
