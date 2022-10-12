import filesystem from "../../../filesystem";
import Command from "../Command";

export default class LsCommand extends Command {
	static get name() {
		return "ls";
	}

	async execute() {
		this._terminal.writeln(JSON.stringify(filesystem.metadata, null, 2));
	}
}
