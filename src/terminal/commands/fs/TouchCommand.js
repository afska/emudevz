import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class TouchCommand extends FilesystemCommand {
	static get name() {
		return "touch";
	}

	async _execute() {
		filesystem.write(this._args[0], this._args[1]); // TODO: TEST!
	}
}
