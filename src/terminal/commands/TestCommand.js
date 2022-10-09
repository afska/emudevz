import _ from "lodash";
import Level from "../../level/Level";
import locales from "../../locales";
import { cliCodeHighlighter } from "../../utils/cli";
import theme from "../style/theme";
import Command from "./Command";
import testContext from "./test/context";
import framework from "./test/framework";

export default class TestCommand extends Command {
	static get name() {
		return "test";
	}

	async execute() {
		const level = Level.current;

		const $ = testContext[level.test?.context]?.prepare(level) || {
			level,
		};

		const overallResult = { allGreen: true };
		const hasMultipleTests = _.keys(level.tests).length > 1;

		for (let fileName in level.tests) {
			const test = level.tests[fileName];

			if (hasMultipleTests)
				await this._terminal.writeln(
					locales.get("testing") + theme.MESSAGE(fileName) + "..."
				);

			const results = await framework.test(test, $);

			for (let result of results)
				await this._printResult(result, overallResult);

			await this._terminal.newline();
		}

		if (overallResult.allGreen) {
			await this._terminal.writeln(locales.get("tests_success"));
			await this._terminal.waitForKey();
			level.advance();
		} else {
			await this._terminal.writeln(locales.get("tests_failure"));
			if (!this._isVerbose)
				await this._terminal.writeln(
					locales.get("tests_more"),
					theme.COMMENT,
					undefined,
					true
				);
		}
	}

	async _printResult(result, overallResult) {
		const emoji = result.passed ? "✔️ " : "❌ ";

		if (!result.passed) {
			await this._terminal.newline();
			overallResult.allGreen = false;
		}

		await this._terminal.writeln(`${emoji} ${result.name}`);

		if (!result.passed) {
			await this._terminal.writeln(result.reason, theme.ERROR);

			if (this._isVerbose) {
				await this._terminal.writeln(
					cliCodeHighlighter.highlight(result.testCode)
				);
			}
		}
	}

	get _isVerbose() {
		return this._includes("-v");
	}
}
