import filesystem from "../../../filesystem";
import locales from "../../../locales";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class RmCommand extends FilesystemCommand {
	static get name() {
		return "rm";
	}

	async _execute() {
		for (let arg of this._fileArgs) {
			const path = this._resolve(arg, true);

			try {
				await this._terminal.writeln(
					`${locales.get("deleting")} ${theme.ACCENT(arg)}...`
				);
				filesystem.rm(path);
			} catch (e) {
				if (e.code !== "EISDIR") throw e;

				try {
					filesystem.rmdir(path);
				} catch (e) {
					if (e.code !== "ENOTEMPTY") throw e;

					if (await this._recursiveCheck()) {
						await this._terminal.writeln(
							locales.get("rm_deleting_recursively"),
							theme.ERROR
						);
						filesystem.rimraf(path);
					}
				}
			}
		}
	}

	async _recursiveCheck() {
		if (this._isRecursive) return true;

		await this._terminal.writeln(
			locales.get("rm_with_files"),
			undefined,
			undefined,
			true
		);
		await this._terminal.writeln(
			locales.get("rm_recursive_flag"),
			theme.COMMENT,
			undefined,
			true
		);
		const key = await this._terminal.waitForKey();
		return key.toLowerCase() === "y";
	}

	get _isRecursive() {
		return this._includes("-rf");
	}
}
