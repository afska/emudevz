import Command from "./Command";

export default class SudoCommand extends Command {
	static get name() {
		return "_sudo_";
	}

	static get isHidden() {
		return true;
	}

	async execute() {
		window.SUDO = true;
	}
}
