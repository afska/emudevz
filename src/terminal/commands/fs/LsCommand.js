import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class LsCommand extends FilesystemCommand {
	static get name() {
		return "ls";
	}

	async _execute() {
		const path = this._resolve(this._args[0] || "");
		this._terminal.writeln(JSON.stringify(filesystem.ls(path), null, 2));
	}
}
