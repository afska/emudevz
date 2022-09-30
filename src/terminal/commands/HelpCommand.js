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
		const findCommand = (it) => commands.find((command) => command.name === it);

		await this._terminal.writeln(
			this._shell.availableCommands
				.filter(findCommand)
				.map(findCommand)
				.map(
					(it) => it.name.padEnd(SPACING) + theme.ACCENT(":: ") + it.description
				)
				.join(NEWLINE)
		);
	}
}
