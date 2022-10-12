import _ from "lodash";
import locales from "../locales";
import commands from "./commands";
import { DISPOSED } from "./errors";
import { theme } from "./style";

const PROMPT_SYMBOL = "$ ";

export default class Shell {
	constructor(terminal) {
		this.terminal = terminal;
		this.isShell = true;
		this.availableCommands = [];
		this.workingDirectory = "/";
	}

	async run() {
		try {
			const commandLine = await this._getNextCommandLine();
			await this.runLine(commandLine);
		} catch (e) {
			if (!e.isUserEvent) throw e;
			if (e !== DISPOSED) this.terminal.restart();
		}
	}

	async runLine(commandLine) {
		const commandParts = commandLine.trim().split(" ");
		const commandName = commandParts[0];
		const args = commandParts.slice(1);

		const Command = commands.find((it) => it.name === commandName);
		const isAvailable =
			this.availableCommands.includes(commandName) ||
			_.isEmpty(this.availableCommands);

		if (!Command || !isAvailable) {
			await this.terminal.writeln(
				`${commandName}: ${locales.get("shell_command_not_found")}`
			);
			this.terminal.restart();
			return;
		}

		await this.terminal.run(new Command(args, this));
	}

	onStop() {
		return true;
	}

	async _getNextCommandLine() {
		let commandLine = "";

		while (commandLine === "") {
			const cwd = this.workingDirectory.slice(1);
			commandLine = await this.terminal.prompt(
				cwd + PROMPT_SYMBOL,
				theme.SYSTEM(cwd) + theme.ACCENT(PROMPT_SYMBOL)
			);
		}

		return commandLine;
	}
}
