import $path from "path";
import filesystem from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

export default class CdCommand extends Command {
	static get name() {
		return "cd";
	}

	static get isHelpCollapsed() {
		return true;
	}

	async execute() {
		try {
			process.$setCwd(this._shell.workingDirectory);
			const path = $path.resolve(this._args[0]);

			const stat = filesystem.stat(path);
			if (stat.isDirectory()) this._shell.workingDirectory = path;
			else throw new Error("not a directoryyyyyyyyy");
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
