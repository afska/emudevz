import locales from "../../locales";
import Program from "../Program";
import { INTERRUPTED } from "../errors";
import { theme } from "../style";

export default class Command extends Program {
	static get name() {
		throw new Error("not_implemented");
	}

	static get description() {
		return locales.get(`command_${this.name}_description`);
	}

	static get isHelpCollapsed() {
		return false;
	}

	static get isHidden() {
		return false;
	}

	constructor(args, shell, restartOnEnd = true) {
		super(shell._terminal);

		this._args = args;
		this._shell = shell;
		this._restartOnEnd = restartOnEnd;
	}

	async run() {
		try {
			await this.execute(this._args, this._shell);
		} catch (e) {
			if (e !== INTERRUPTED) throw e;
		}

		if (this._restartOnEnd) this._terminal.restart();
	}

	async execute() {
		throw new Error("not_implemented");
	}

	onStop() {
		return true;
	}

	usesAutocomplete() {
		return false;
	}

	usesInputHistory() {
		return false;
	}

	_includes(arg) {
		return this._args.some((it) => it.toLowerCase() === arg);
	}

	async _notAvailable() {
		await this._terminal.writeln(locales.get("not_available"), theme.WARNING);
	}
}
