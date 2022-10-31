import $path from "path";
import filesystem from "../../../filesystem";
import FilesystemCommand from "./FilesystemCommand";

export default class MvCommand extends FilesystemCommand {
	static get name() {
		return "mv";
	}

	async _execute() {
		const oldPath = this._resolve(this._args[0], true);
		let newPath = this._resolve(this._args[1]);

		try {
			const stat = filesystem.stat(newPath);
			if (stat.isDirectory()) newPath += `/${$path.parse(oldPath).base}`;
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
		}

		this._resolve(newPath, true);
		filesystem.mv(oldPath, newPath);
	}
}
