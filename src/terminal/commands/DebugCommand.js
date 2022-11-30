import Command from "./Command";

export default class DebugCommand extends Command {
	static get name() {
		return "_debug_";
	}

	static get isHidden() {
		return true;
	}

	async execute() {
		window.DEBUG = true;
	}
}
