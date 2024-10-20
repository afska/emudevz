import $path from "path-browserify-esm";
import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class MvCommand extends FilesystemCommand {
	static get name() {
		return "mv";
	}

	async _execute() {
		const oldPath = this._resolve(this._fileArgs[0], true);
		let newPath = this._resolve(this._fileArgs[1]);

		try {
			const stat = filesystem.stat(newPath);
			const name = $path.parse(oldPath).base;
			if (stat.isDirectory) newPath += `/${name}`;
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
		}

		this._resolve(newPath, true);
		filesystem.mv(oldPath, newPath);
	}
}
