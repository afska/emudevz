import { superEval } from "../../utils";
import cliHighlighter from "../../utils/cli/cliHighlighter";
import theme from "../style/theme";
import Command from "./Command";

const PROMPT_SYMBOL = "> ";

export default class ReplCommand extends Command {
	static get name() {
		return "repl";
	}

	async execute() {
		while (true) {
			let expression = "";

			while (expression === "")
				expression = await this._terminal.prompt(PROMPT_SYMBOL, theme.INPUT);

			try {
				const resultModule = await superEval(`export default ${expression}`);
				this._terminal.writeln(
					cliHighlighter.highlight(this._format(resultModule.default))
				);
			} catch (e) {
				this._terminal.writeln("❌  " + theme.ERROR(e.message));
			}
		}
	}

	_format(expression) {
		switch (typeof expression) {
			case "object":
				return JSON.stringify(expression, null, 2);
			case "string":
				return `"${expression}"`;
			case "function":
				return `<function>`;
			// TODO: ESCAPE
			// TODO: await new Promise(() => {})
			// TODO: INFINITE LOOPS
			// TODO: ALTGR + }
			// TODO: MEMORY
			default:
				return `${expression}`;
		}
	}
}
