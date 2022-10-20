import filesystem from "../../../filesystem";
import locales from "../../../locales";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class RmCommand extends FilesystemCommand {
	static get name() {
		return "rm";
	}

	async _execute() {
		const path = this._resolve(this._args[0], true);

		try {
			filesystem.rm(path);
		} catch (e) {
			if (e.code !== "EISDIR") throw e;

			try {
				filesystem.rmdir(path);
			} catch (e) {
				if (e.code !== "ENOTEMPTY") throw e;

				await this._terminal.writeln(
					locales.get("rm_with_files"),
					undefined,
					undefined,
					true
				);
				const key = await this._terminal.waitForKey();
				if (key.toLowerCase() === "y") {
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
