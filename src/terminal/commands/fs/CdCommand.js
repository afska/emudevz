import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class CdCommand extends FilesystemCommand {
	static get name() {
		return "cd";
	}

	async _execute() {
		const path = this._resolve(this._args[0]);
		const stat = filesystem.stat(path);

		if (stat.isDirectory()) this._shell.workingDirectory = path;
		else throw new Error(`ENOTDIR: not a directory., '${path}'`);
	}
}
