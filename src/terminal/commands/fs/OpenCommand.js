import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class OpenCommand extends FilesystemCommand {
	static get name() {
		return "open";
	}

	async _execute() {
		this._terminal.writeln(filesystem.read(this._args[0]));
	}
}
