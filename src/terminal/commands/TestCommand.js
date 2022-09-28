import Level from "../../level/Level";
import Command from "./Command";

export default class TestCommand extends Command {
	static get name() {
		return "test";
	}

	async execute() {
		const level = Level.current;

		// await this._terminal.writeln("YOU WIN (?");
		// level.advance();
	}
}
