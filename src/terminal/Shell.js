import commands from "./commands";
import locales from "../locales";

export default class Shell {
	constructor(terminal) {
		this.terminal = terminal;
		this.availableCommands = [];
	}

	async run() {
		try {
			const commandLine = await this._getNextCommandLine();
			await this.runLine(commandLine);
		} catch (e) {
			if (e !== "interrupted") throw e;
			this.run();
		}
	}

	async runLine(commandLine) {
		const commandParts = commandLine.trim().split(" ");
		const commandName = commandParts[0];
		const args = commandParts.slice(1);

		const Command = commands.find((it) => it.name === commandName);
		const isAvailable = this.availableCommands.includes(commandName);

		if (!Command || !isAvailable) {
			await this.terminal.writeln(
				`${commandName}: ${locales.get("shell_command_not_found")}`
			);
			this.run();
			return;
		}

		this.terminal.run(new Command(args, this));
	}

	async _getNextCommandLine() {
		let commandLine = "";

		while (commandLine === "") commandLine = await this.terminal.prompt();

		return commandLine;
	}

	onStop() {
		return false;
	}
}
