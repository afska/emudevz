import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class MvCommand extends FilesystemCommand {
	static get name() {
		return "mv";
	}

	async _execute() {
		filesystem.mv(this._args[0], this._args[1]);
	}
}
