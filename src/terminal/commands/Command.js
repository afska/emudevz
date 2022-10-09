import locales from "../../locales";

export default class Command {
	static get name() {
		throw new Error("not_implemented");
	}

	static get description() {
		return locales.get(`command_${this.name}_description`);
	}

	constructor(args, shell) {
		this._args = args;
		this._shell = shell;
	}

	async run() {
		try {
			await this.execute(this._args, this._shell);
		} catch (e) {
			if (e !== "interrupted") throw e;
		}

		this._terminal.restart();
	}

	async execute() {
		throw new Error("not_implemented");
	}

	onStop() {
		return true;
	}

	_includes(arg) {
		return this._args.some((it) => it.toLowerCase() === arg);
	}

	get _terminal() {
		return this._shell.terminal;
	}
}
