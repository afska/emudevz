import Command from "./Command";

export default class ClearCommand extends Command {
	static get name() {
		return "clear";
	}

	async execute(args) {
		setTimeout(() => this._terminal.clear());
	}
}
