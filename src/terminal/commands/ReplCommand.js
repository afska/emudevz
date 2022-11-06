import { cliCodeHighlighter } from "../../utils/cli";
import { contextEval } from "../../utils/eval";
import theme from "../style/theme";
import Command from "./Command";

const PROMPT_SYMBOL = "> ";

export default class ReplCommand extends Command {
	static get name() {
		return "repl";
	}

	async execute() {
		const context = contextEval.create();

		while (true) {
			let expression = "";

			while (expression === "")
				expression = await this._terminal.prompt(
					PROMPT_SYMBOL,
					theme.INPUT(PROMPT_SYMBOL),
					true
				);
			this._addInputHistory(expression);

			if (expression.trim().startsWith("{") && expression.trim().endsWith("}"))
				expression = `(${expression.trim()})`;

			try {
				const result = context.eval(expression);
				await this._terminal.writeln(
					cliCodeHighlighter.highlight(this._format(result))
				);
			} catch (e) {
				await this._terminal.writeln(
					"❌  " + theme.ERROR(e?.message || e?.toString() || "?")
				);
			}
		}
	}

	usesInputHistory() {
		return true;
	}

	_format(expression) {
		switch (typeof expression) {
			case "object":
				try {
					return JSON.stringify(expression, null, 2);
				} catch (e) {
					if (e.message.includes("Converting circular structure to JSON"))
						return "<object>";
					else throw e;
				}
			case "string":
				return JSON.stringify(expression);
			case "function":
				return `<function>`;
			default:
				return `${expression}`;
		}
	}
}
