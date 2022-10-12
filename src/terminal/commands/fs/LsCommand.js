import filesystem from "../../../filesystem";
import { theme } from "../../style";
import Command from "../Command";

export default class LsCommand extends Command {
	static get name() {
		return "ls";
	}

	async execute() {
		try {
			this._terminal.writeln(JSON.stringify(filesystem.ls("/"), null, 2));
		} catch (e) {
			this._terminal.writeln("❌  " + theme.ERROR(e.message));
		}
	}
}
