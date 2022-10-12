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
			const stat = filesystem.stat(this._args[0]);
			if (stat.isDirectory()) this._shell.workingDirectory = this._args[0];
			else throw new Error("not a directoryyyyyyyyy");
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
