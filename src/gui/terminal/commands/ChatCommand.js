import locales from "../../locales";

export default class ChatCommand {
	static get name() {
		return "chat";
	}

	static get description() {
		return locales.get("command_chat_description");
	}

	constructor(terminal) {
		this._terminal = terminal;
	}

	// TODO: ASD
	run(args) {}
}
