import filesystem from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

export default class OpenCommand extends Command {
	static get name() {
		return "open";
	}

	static get isHelpCollapsed() {
		return true;
	}

	async execute() {
		try {
			this._terminal.writeln(filesystem.read(this._args[0]));
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
