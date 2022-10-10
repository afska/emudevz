import Level from "../../level/Level";
import locales from "../../locales";
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
		if (this._isTerminal) await this._printTerminalHelp();
		else await this._printNormalHelp();

		const help = Level.current.localizedHelp;
		if (help != null) await this._printLevelHelp(help);
	}

	async _printTerminalHelp() {
		await this._terminal.writeln(
			locales.get("help_terminal"),
			undefined,
			undefined,
			true
		);
	}

	async _printNormalHelp() {
		const findCommand = (it) => commands.find((command) => command.name === it);

		await this._terminal.writeln(
			this._shell.availableCommands
				.filter(findCommand)
				.map(findCommand)
				.map(
					(it) =>
						theme.SYSTEM(it.name.padEnd(SPACING)) +
						theme.ACCENT(":: ") +
						it.description
				)
				.join(NEWLINE)
		);

		await this._terminal.writeln(
			"\n" + locales.get("help_more"),
			theme.COMMENT,
			undefined,
			true
		);
	}

	async _printLevelHelp(help) {
		await this._terminal.writeln(
			"\n" + help.trim(),
			undefined,
			undefined,
			true
		);
	}

	get _isTerminal() {
		return this._includes("-t");
	}
}
