import filesystem from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

export default class RmCommand extends Command {
	static get name() {
		return "rm";
	}

	async execute() {
		try {
			filesystem.rm(this._args[0]);
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
