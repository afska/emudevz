import Command from "./Command";

export default class ClearCommand extends Command {
	static get name() {
		return "clear";
	}

	async execute() {
		setTimeout(() => this._terminal.clear());
	}
}
