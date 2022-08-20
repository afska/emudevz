import locales from "../../locales";

export default class ClearCommand {
	static get name() {
		return "clear";
	}

	static get description() {
		return locales.get("command_clear_description");
	}

	constructor(terminal) {
		this._terminal = terminal;
	}

	// TODO: ASD
	run(args) {}
}
