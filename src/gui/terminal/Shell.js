import commands from "./commands";
import locales from "../locales";
import theme from "./theme";

export default class Shell {
	constructor(terminal) {
		this._terminal = terminal;
	}

	async run() {
		const commandLine = await this._getNextCommandLine();
		const commandParts = commandLine.trim().split(" ");
		const commandName = commandParts[0];

		const Command = commands.find((it) => it.name === commandName);
		if (!Command) {
			this._terminal.writeln(`${commandName}: command not found`);
			this.run();
			return;
		}

		this._terminal.run(new Command(this._terminal));
	}

	onStop() {
		return false;
	}

	async _getNextCommandLine() {
		let commandLine = null;

		while (commandLine == null) {
			try {
				commandLine = await this._terminal.prompt();
			} catch (e) {}
		}

		return commandLine;
	}
}
