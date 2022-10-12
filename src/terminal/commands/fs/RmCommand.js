import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class RmCommand extends FilesystemCommand {
	static get name() {
		return "rm";
	}

	async _execute() {
		const path = this._resolve(this._args[0], true);
		filesystem.rm(path);
	}
}
