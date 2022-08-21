import Command from "./Command";
import { theme } from "../style";

const SPEED = 10;

export default class ChatCommand extends Command {
	static get name() {
		return "chat";
	}

	async execute(args) {
		await this._terminal.writeln(
			">> hi I'm a test message 😋  writing text 📙  very slow",
			theme.MESSAGE,
			SPEED
		);
		await this._terminal.writeln(">> what's your name?", theme.MESSAGE, SPEED);
		const name = await this._terminal.prompt("?? ", theme.INPUT);
		await this._terminal.writeln(
			">> ok then, hi " + name + "!",
			theme.MESSAGE,
			SPEED
		);
	}
}
