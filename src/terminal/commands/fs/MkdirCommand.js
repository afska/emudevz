import filesystem from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

export default class LsCommand extends Command {
	static get name() {
		return "mkdir";
	}

	static get isHelpCollapsed() {
		return true;
	}

	async execute() {
		try {
			filesystem.mkdir(this._args[0]);
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
