import Level from "../../../level/Level";
import FilesystemCommand from "./FilesystemCommand";

export default class OpenCommand extends FilesystemCommand {
	static get name() {
		return "open";
	}

	async _execute() {
		const path = this._resolve(this._args[0]);
		Level.current.openFile(path);
		// TODO: CHECK FILE TYPE
		this._terminal.writeln("Opening " + this._args[0] + "...");
	}
}
