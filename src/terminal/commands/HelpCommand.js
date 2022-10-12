import _ from "lodash";
import Level from "../../level/Level";
import locales from "../../locales";
import { theme } from "../style";
import commands from ".";
import Command from "./Command";

const NEWLINE = "\n";
const SPACING = 10;

export default class HelpCommand extends Command {
	static get name() {
		return "help";
	}

	async execute() {
		await this._printNormalHelp();

		if (this._isAll) {
			await this._printTerminalHelp();
		} else {
			await this._terminal.writeln(
				locales.get("help_more"),
				theme.COMMENT,
				undefined,
				true
			);
		}

		const help = Level.current.localizedHelp;
		if (this._isAll && help != null) {
			await this._terminal.writeln(
				NEWLINE + locales.get("help_level"),
				theme.COMMENT
			);
			await this._printLevelHelp(help);
		}
	}

	async _printNormalHelp() {
		const findCommand = (it) => commands.find((command) => command.name === it);

		const availableCommands = _.isEmpty(this._shell.availableCommands)
			? commands.map((it) => it.name)
			: this._shell.availableCommands;

		await this._terminal.writeln(
			availableCommands
				.filter(findCommand)
				.map(findCommand)
				.filter((it) => !it.isHelpCollapsed || this._isAll)
				.map(
					(it) =>
						theme.SYSTEM(it.name.padEnd(SPACING)) +
						theme.ACCENT(":: ") +
						it.description
				)
				.join(NEWLINE)
		);
		await this._terminal.newline();
	}

	async _printTerminalHelp() {
		await this._terminal.writeln(
			locales.get("help_terminal"),
			undefined,
			undefined,
			true
		);
	}

	async _printLevelHelp(help) {
		await this._terminal.writeln(help.trim(), undefined, undefined, true);
	}

	get _isAll() {
		return this._includes("-a");
	}
}
