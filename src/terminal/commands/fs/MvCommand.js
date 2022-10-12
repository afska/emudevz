import filesystem from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

export default class MvCommand extends Command {
	static get name() {
		return "mv";
	}

	static get isHelpCollapsed() {
		return true;
	}

	async execute() {
		try {
			filesystem.mv(this._args[0], this._args[1]);
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
