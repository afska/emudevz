import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class RmCommand extends FilesystemCommand {
	static get name() {
		return "rm";
	}

	async _execute() {
		filesystem.rm(this._args[0]);
	}
}
