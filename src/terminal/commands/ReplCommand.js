import _ from "lodash";
import Level from "../../level/Level";
import { cliCodeHighlighter } from "../../utils/cli";
import { contextEval } from "../../utils/eval";
import theme from "../style/theme";
import Command from "./Command";
import testContext from "./test/context";

const PROMPT_SYMBOL = "> ";
const FUNCTION = "<function>";
const OBJECT = "<object>";

export default class ReplCommand extends Command {
	static get name() {
		return "repl";
	}

	async execute() {
		const level = Level.current;
		const $ = testContext.javascript.prepare(level);
		const module = await $.evaluate();
		const context = contextEval.create(module);

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
					const withFunctions = _.mapValues(expression, (v) => {
						if (typeof v === "function") return FUNCTION;
						return v;
					});

					return JSON.stringify(withFunctions, null, 2);
				} catch (e) {
					if (e.message.includes("Converting circular structure to JSON"))
						return OBJECT;
					else throw e;
				}
			case "string":
				return JSON.stringify(expression);
			case "function":
				return FUNCTION;
			default:
				return `${expression}`;
		}
	}
}
