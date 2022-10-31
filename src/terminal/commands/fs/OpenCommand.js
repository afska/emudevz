import filesystem from "../../../filesystem";
import locales from "../../../locales";
import store from "../../../store";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class OpenCommand extends FilesystemCommand {
	static get name() {
		return "open";
	}

	async _execute() {
		for (let arg of this._fileArgs) {
			const path = this._resolve(arg);
			const stat = filesystem.stat(path);
			if (stat.isDirectory())
				throw new Error(`EISDIR: File is a directory., '${path}'`);

			await this._terminal.writeln(
				`${locales.get("opening")} ${theme.ACCENT(arg)}...`
			);
			store.dispatch.savedata.openFile(path);
		}
	}
}
