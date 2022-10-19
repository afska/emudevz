import filesystem from "../../../filesystem";
import Level from "../../../level/Level";
import locales from "../../../locales";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class OpenCommand extends FilesystemCommand {
	static get name() {
		return "open";
	}

	async _execute() {
		const path = this._resolve(this._args[0]);
		const stat = filesystem.stat(path);
		if (stat.isDirectory())
			throw new Error(`EISDIR: File is a directory., '${path}'`);

		this._terminal.writeln(
			`${locales.get("opening")} ${theme.ACCENT(this._args[0])}...`
		);
		Level.current.openFile(path);
	}
}
