import filesystem from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

export default class TouchCommand extends Command {
	static get name() {
		return "touch";
	}

	static get isHelpCollapsed() {
		return true;
	}

	async execute() {
		try {
			filesystem.write(this._args[0], "");
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
