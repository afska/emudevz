import filesystem from "../../../filesystem";
import locales from "../../../locales";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class TouchCommand extends FilesystemCommand {
	static get name() {
		return "touch";
	}

	async _execute() {
		for (let arg of this._fileArgs) {
			const path = this._resolve(arg, true);

			await this._terminal.writeln(
				`${locales.get("creating_file")} ${theme.ACCENT(arg)}...`
			);
			filesystem.write(path, "");
		}
	}
}
