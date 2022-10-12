import filesystem from "../../../filesystem";
import Command from "../Command";

export default class TouchCommand extends Command {
	static get name() {
		return "touch";
	}

	async execute() {
		filesystem.write(this._args[0], "");
	}
}
