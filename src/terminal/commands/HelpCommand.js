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
		await this._printCommandsHelp();

		const help = Level.current.localizedHelp;
		if (help != null) {
			await this._terminal.writeln(
				NEWLINE + locales.get("help_level"),
				theme.COMMENT
			);
			await this._printLevelHelp(help);
		}

		if (this._isAll) await this._printTerminalHelp();

		if (!this._isAll)
			await this._terminal.writeln(
				NEWLINE + locales.get("help_more"),
				theme.COMMENT,
				undefined,
				true
			);
	}

	async _printCommandsHelp() {
		const findCommand = (it) => commands.find((command) => command.name === it);

		const availableCommands = _.isEmpty(this._shell.availableCommands)
			? commands.map((it) => it.name)
			: this._shell.availableCommands;

		let more = false;
		await this._terminal.writeln(
			availableCommands
				.filter(findCommand)
				.map(findCommand)
				.filter((it) => {
					const show = !it.isHelpCollapsed || this._isAll;
					if (!show) more = true;
					return show;
				})
				.map(
					(it) =>
						theme.SYSTEM(it.name.padEnd(SPACING)) + "~::~ " + it.description
				)
				.join(NEWLINE),
			undefined,
			undefined,
			true
		);
		if (more) await this._terminal.writeln("<...>", theme.ACCENT);
	}

	async _printTerminalHelp() {
		await this._terminal.writeln(
			NEWLINE + locales.get("help_terminal"),
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
