import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class MvCommand extends FilesystemCommand {
	static get name() {
		return "mv";
	}

	async _execute() {
		const oldPath = this._resolve(this._args[0], true);
		const newPath = this._resolve(this._args[1], true);
		filesystem.mv(oldPath, newPath);
	}
}
