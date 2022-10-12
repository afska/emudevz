import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class TouchCommand extends FilesystemCommand {
	static get name() {
		return "touch";
	}

	async _execute() {
		const path = this._resolve(this._args[0]);
		filesystem.write(path, this._args[1]); // TODO: TEST!
	}
}
