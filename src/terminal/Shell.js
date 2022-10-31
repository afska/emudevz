import escapeStringRegexp from "escape-string-regexp";
import _ from "lodash";
import filesystem from "../filesystem";
import locales from "../locales";
import commands from "./commands";
import { DISPOSED } from "./errors";
import { theme } from "./style";

const ARGUMENT_SEPARATOR = " ";
const PROMPT_SYMBOL = "$ ";
const WILDCARD = "*";

export default class Shell {
	constructor(terminal) {
		this.terminal = terminal;
		this.isShell = true;
		this.availableCommands = [];
		this.workingDirectory = "/";
	}

	get allAvailableCommands() {
		return _.isEmpty(this.availableCommands)
			? commands.map((it) => it.name)
			: this.availableCommands;
	}

	async run() {
		try {
			this.terminal.autocompleteOptions = this.allAvailableCommands;
			const commandLine = await this._getNextCommandLine();
			await this.runLine(commandLine);
		} catch (e) {
			if (!e.isUserEvent) throw e;
			if (e !== DISPOSED) this.terminal.restart();
		}
	}

	async runLine(commandLine) {
		const commandParts = commandLine.trim().split(ARGUMENT_SEPARATOR);
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

		await this._runCommand(Command, args);
	}

	onInput(input) {
		const commandParts = input.split(ARGUMENT_SEPARATOR);

		if (commandParts.length > 1) {
			const lastPart = _.last(commandParts);
			const path = lastPart.split("/").slice(0, -1).join("/");

			try {
				const absolutePath = filesystem.resolve(path, this.workingDirectory);
				const files = filesystem.ls(absolutePath).map((it) => {
					return (
						path +
						(path !== "" ? "/" : "") +
						(it.isDirectory ? `${it.name}/` : it.name)
					);
				});
				this.terminal.autocompleteOptions = files;
			} catch (e) {
				this.terminal.autocompleteOptions = [];
			}
		} else this.terminal.autocompleteOptions = this.allAvailableCommands;
	}

	onStop() {
		return true;
	}

	usesAutocomplete() {
		return true;
	}

	async _runCommand(Command, args) {
		const wildcardIndex = _.findIndex(args, (it) => it.includes(WILDCARD));
		const lastWildcardIndex = _.findLastIndex(args, (it) =>
			it.includes(WILDCARD)
		);

		if (wildcardIndex !== -1 && wildcardIndex === lastWildcardIndex) {
			await this._runWildcard(Command, args, wildcardIndex);
		} else {
			await this.terminal.run(new Command(args, this));
		}
	}

	async _runWildcard(Command, args, wildcardIndex) {
		const expression = args[wildcardIndex];
		const regexp = new RegExp(
			escapeStringRegexp(expression).replace("\\*", ".*")
		);

		const files = filesystem.ls(this.workingDirectory);
		const filteredFiles = files.filter((it) => {
			return regexp.test(it.name);
		});

		for (let filteredFile of filteredFiles) {
			args[wildcardIndex] = filteredFile.name;
			await this.terminal.run(new Command(args, this, false));
		}
		this.terminal.restart();
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
