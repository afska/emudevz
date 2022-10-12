import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class MkdirCommand extends FilesystemCommand {
	static get name() {
		return "mkdir";
	}

	async _execute() {
		filesystem.mkdir(this._args[0]);
	}
}
