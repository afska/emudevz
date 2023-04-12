import $path from "path";
import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class CpCommand extends FilesystemCommand {
	static get name() {
		return "cp";
	}

	async _execute() {
		const oldPath = this._resolve(this._fileArgs[0]);
		let newPath = this._resolve(this._fileArgs[1]);

		try {
			const stat = filesystem.stat(newPath);
			const name = $path.parse(oldPath).base;
			if (stat.isDirectory) newPath += `/${name}`;
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
		}

		this._resolve(newPath, true);
		filesystem.cpr(oldPath, newPath);
	}

	get _isRecursive() {
		return this._includes("-r");
	}
}
