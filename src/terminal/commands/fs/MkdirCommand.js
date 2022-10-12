import filesystem from "../../../filesystem";
import Command from "../Command";

export default class LsCommand extends Command {
	static get name() {
		return "mkdir";
	}

	async execute() {
		filesystem.mkdir(this._args[0]);
	}
}
