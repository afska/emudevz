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
		if (this._isKeys) {
			await this._terminal.writehlln(locales.get("help_shortcuts"));
			return;
		}

		await this._printCommandsHelp();

		const help = Level.current.localizedHelp;
		if (help != null) {
			await this._terminal.writeln(
				NEWLINE + locales.get("help_level"),
				theme.COMMENT
			);
			await this._terminal.writehlln(help.trim());
		}

		if (!this._isAll) {
			await this._terminal.writehlln(
				NEWLINE + locales.get("help_more"),
				theme.COMMENT
			);
		} else {
			await this._terminal.writehlln(
				NEWLINE + locales.get("help_keys"),
				theme.COMMENT
			);
		}
	}

	async _printCommandsHelp() {
		const findCommand = (it) => commands.find((command) => command.name === it);

		const availableCommands = this._shell.allAvailableCommands;

		let more = false;
		await this._terminal.writehlln(
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
				.join(NEWLINE)
		);
		if (more) await this._terminal.writeln("<...>", theme.ACCENT);
	}

	get _isAll() {
		return this._includes("-a");
	}

	get _isKeys() {
		return this._includes("keys");
	}
}
