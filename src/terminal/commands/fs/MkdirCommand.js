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
			filesystem.mkdir(path);
		}
	}
}
