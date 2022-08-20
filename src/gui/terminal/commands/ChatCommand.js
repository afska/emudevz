import Command from "./Command";

export default class ChatCommand extends Command {
	static get name() {
		return "chat";
	}

	// TODO: ASD
	async execute(args) {}
}
