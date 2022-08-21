import Command from "./Command";
import theme from "../theme";

const SPEED = 30;

export default class ChatCommand extends Command {
	static get name() {
		return "chat";
	}

	async execute(args) {
		await this._terminal.writeln(
			">> hi I'm a test message 😋  writing text 📙  very slow",
			theme.ACCENT,
			SPEED
		);
	}
}
