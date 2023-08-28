import filesystem from "../../../filesystem";
import locales from "../../../locales";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class MkdirCommand extends FilesystemCommand {
	static get name() {
		return "mkdir";
	}

	async _execute() {
		for (let arg of this._fileArgs) {
			const path = this._resolve(arg, true);

			await this._terminal.writeln(
				`${locales.get("creating_directory")} ${theme.ACCENT(arg)}...`
			);

			try {
				if (this._isParent) filesystem.mkdirp(path);
				else filesystem.mkdir(path);
			} catch (e) {
				if (e.code === "ENOENT" && !this._isParent) {
					await this._terminal.writehlln(
						locales.get("mkdir_parent_flag"),
						theme.COMMENT
					);
				}
				throw e;
			}
		}
	}

	get _isParent() {
		return this._includes("-p");
	}
}
