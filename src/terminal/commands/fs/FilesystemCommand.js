import $path from "path";
import { theme } from "../../style";
import Command from "../Command";

const ERROR_PREFIX = /^Error: /;

export default class FilesystemCommand extends Command {
	static get isHelpCollapsed() {
		return true;
	}

	async execute() {
		try {
			await this._execute();
		} catch (e) {
			this._terminal.writeln(
				"❌  " + theme.ERROR(e.message.replace(ERROR_PREFIX, ""))
			);
		}
	}

	async _execute() {
		throw new Error("not_implemented");
	}

	_resolve(path) {
		if (!path) throw new Error("A path is required");
		process.$setCwd(this._shell.workingDirectory);
		return $path.resolve(path);
	}
}
