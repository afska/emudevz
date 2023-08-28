import _ from "lodash";
import Level from "../../level/Level";
import locales from "../../locales";
import { cliCodeHighlighter } from "../../utils/cli";
import { contextEval } from "../../utils/eval";
import { CANCELED } from "../errors";
import theme from "../style/theme";
import Command from "./Command";
import testContext from "./test/context";

const MAX_CHILDREN = 11;
const PROMPT_SYMBOL = "> ";
const FUNCTION = "<function>";
const BINARY = "<binary>";
const OBJECT = "<object>";
const BIG_ARRAY = "<big-array>";
const BIG_OBJECT = "<big-object>";

export default class ReplCommand extends Command {
	static get name() {
		return "repl";
	}

	async execute() {
		const level = Level.current;

		let $;
		try {
			$ = (await testContext.javascript.prepare(level).evaluate())?.default;
			await this._terminal.writehlln(
				locales.get("repl_code_success"),
				theme.COMMENT
			);
		} catch (e) {
			await this._terminal.writehlln(
				locales.get("repl_code_error"),
				theme.WARNING
			);
			if (e?.message != null)
				await this._terminal.writehlln(e.message, theme.ERROR);
		}

		const context = contextEval.create($);

		while (true) {
			let expression = "";

			while (expression === "") {
				try {
					expression = await this._terminal.prompt(
						PROMPT_SYMBOL,
						theme.INPUT(PROMPT_SYMBOL),
						true
					);
				} catch (e) {
					if (e !== CANCELED) throw e;
				}
			}
			this._addInputHistory(expression);

			if (expression.trim().startsWith("{") && expression.trim().endsWith("}"))
				expression = `(${expression.trim()})`;

			try {
				const result = context.eval(expression);
				const formattedResult = this._format(result);
				await this._terminal.writeln(
					cliCodeHighlighter.highlight(formattedResult)
				);
				if (
					!this._isVerbose &&
					(formattedResult.includes(BIG_OBJECT) ||
						formattedResult.includes(BIG_ARRAY))
				) {
					await this._terminal.writeln(
						locales.get("command_repl_avoid_collapsing"),
						theme.COMMENT
					);
				}
			} catch (e) {
				await this._terminal.writeln(
					"❌  " + theme.ERROR(e?.message || e?.toString() || "?")
				);
			}
		}
	}

	onStop() {
		if (this._terminal.hasPendingInput) {
			this._terminal.cancelPrompt();
			return false;
		}

		return true;
	}

	usesInputHistory() {
		return true;
	}

	_format(expression) {
		if (expression instanceof Uint8Array) return `"${BINARY}"`;

		switch (typeof expression) {
			case "object":
				try {
					if (Array.isArray(expression)) {
						if (expression.length > MAX_CHILDREN && !this._isVerbose) {
							return `"${BIG_ARRAY}"`;
						} else {
							const sanitized = expression.map((v) =>
								JSON.parse(this._format(v))
							);
							return JSON.stringify(sanitized, null, 2);
						}
					} else {
						if (_.keys(expression).length > MAX_CHILDREN && !this._isVerbose) {
							return `"${BIG_OBJECT}"`;
						} else {
							const sanitized = _.mapValues(expression, (v) =>
								JSON.parse(this._format(v))
							);
							return JSON.stringify(sanitized, null, 2);
						}
					}
				} catch (e) {
					if (e.message.includes("Converting circular structure to JSON"))
						return OBJECT;
					else throw e;
				}
			case "string":
				return JSON.stringify(expression);
			case "function":
				return `"${FUNCTION}"`;
			default:
				return `${expression}`;
		}
	}

	get _isVerbose() {
		return this._includes("-v");
	}
}
