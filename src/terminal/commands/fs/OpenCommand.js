import filesystem from "../../../filesystem";
import TV from "../../../gui/components/TV";
import extensions from "../../../gui/extensions";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import { theme } from "../../style";
import FilesystemCommand from "./FilesystemCommand";

export default class OpenCommand extends FilesystemCommand {
	static get name() {
		return "open";
	}

	static open(filePath) {
		if (!filesystem.exists(filePath)) return -1;
		if (filesystem.stat(filePath).isDirectory) return -2;
		const [Component, customArgs] = extensions.getOptions(filePath);

		if (Component === TV && customArgs.type === "rom") {
			const rom = filesystem.read(filePath, { binary: true });
			Level.current.launchEmulator(rom);
		} else {
			store.dispatch.savedata.openFile(filePath);
		}
		return true;
	}

	async _execute() {
		for (let arg of this._fileArgs) {
			const path = this._resolve(arg);
			const stat = filesystem.stat(path);
			if (stat.isDirectory)
				throw new Error(`EISDIR: File is a directory., '${path}'`);

			await this._terminal.writeln(
				`${locales.get("opening")} ${theme.ACCENT(arg)}...`
			);

			OpenCommand.open(path);
		}
	}
}
