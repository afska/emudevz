import Command from "./Command";

export default class ClearCommand extends Command {
	static get name() {
		return "clear";
	}

	// TODO: ASD
	async execute(args) {}
}
