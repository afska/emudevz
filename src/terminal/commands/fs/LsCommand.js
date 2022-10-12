import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class LsCommand extends FilesystemCommand {
	static get name() {
		return "ls";
	}

	async _execute() {
		this._terminal.writeln(JSON.stringify(filesystem.ls("/"), null, 2));
	}
}
