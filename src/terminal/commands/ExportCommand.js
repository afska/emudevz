import filesystem from "../../filesystem";
import locales from "../../locales";
import store from "../../store";
import { filepicker } from "../../utils";
import { theme } from "../style";
import Command from "./Command";

const FILE_NAME = "FixedNEEES.zip";

export default class ExportCommand extends Command {
	static get name() {
		return "export";
	}

	static get isBlocked() {
		return !store.getState().savedata.unlockedUnits.useConsole;
	}

	static get isHidden() {
		return this.isBlocked;
	}

	async execute() {
		if (this.constructor.isBlocked) return this._notAvailable();

		try {
			const { default: exportEmulator } = await import("../../export/export");
			const read = (path) =>
				filesystem.withSymlinks(false, () => filesystem.read(path));

			const zipped = await exportEmulator(read);
			filepicker.saveAs(zipped, FILE_NAME);

			await this._terminal.writeln(locales.get("export_success"), theme.SYSTEM);
		} catch (err) {
			await this._terminal.writeln(
				`${locales.get("export_error")} ${err.message}`,
				theme.ERROR
			);
		}
	}
}
