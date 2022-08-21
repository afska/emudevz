import locales from "../../locales";

export default class Command {
	static get name() {
		throw new Error("not_implemented");
	}

	static get description() {
		return locales.get(`command_${this.name}_description`);
	}

	constructor(terminal) {
		this._terminal = terminal;
	}

	async run(args) {
		await this.execute(args);
		this._terminal.restart();
	}

	async execute(args) {
		throw new Error("not_implemented");
	}

	onStop() {
		return true;
	}
}
