import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class MkdirCommand extends FilesystemCommand {
	static get name() {
		return "mkdir";
	}

	async _execute() {
		const path = this._resolve(this._args[0], true);
		filesystem.mkdir(path);
	}
}
