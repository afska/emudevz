import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class OpenCommand extends FilesystemCommand {
	static get name() {
		return "open";
	}

	async _execute() {
		const path = this._resolve(this._args[0]);
		this._terminal.writeln(filesystem.read(path));
	}
}
