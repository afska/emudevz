import _ from "lodash";
import Level from "../../level/Level";
import locales from "../../locales";
import cliHighlighter from "../../utils/cli/cliHighlighter";
import theme from "../style/theme";
import Command from "./Command";
import framework from "./test/framework";

export default class TestCommand extends Command {
	static get name() {
		return "test";
	}

	async execute() {
		const level = Level.current;

		let allGreen = true;
		const hasMultipleTests = _.keys(level.tests).length > 1;

		for (let fileName in level.tests) {
			const test = level.tests[fileName];

			if (hasMultipleTests)
				await this._terminal.writeln(
					locales.get("testing") + theme.MESSAGE(fileName) + "..."
				);

			const results = await framework.test(test);

			for (let result of results) {
				const emoji = result.passed ? "✔️ " : "❌ ";

				if (!result.passed) {
					if (allGreen) await this._terminal.newline();
					allGreen = false;
				}

				await this._terminal.writeln(`${emoji} ${result.name}`);

				if (!result.passed) {
					await this._terminal.writeln(result.reason, theme.ERROR);
					await this._terminal.writeln(
						cliHighlighter.highlight(result.testCode, {
							language: "javascript",
						})
					);
				}
			}

			await this._terminal.newline();
		}

		if (allGreen) {
			await this._terminal.writeln(locales.get("tests_success"));
			await new Promise(() => {});
			// level.advance();
		} else {
			await this._terminal.writeln(locales.get("tests_failure"));
		}
	}
}
