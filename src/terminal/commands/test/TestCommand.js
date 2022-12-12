import _ from "lodash";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import { bus } from "../../../utils";
import { cliCodeHighlighter } from "../../../utils/cli";
import theme from "../../style/theme";
import Command from "../Command";
import testContext from "./context";
import framework from "./framework";

const ERROR = 2;
const LOCATION_DETECT_REGEXP = /📌 {2}(.+:?\d*) 📌/gu;
const LOCATION_PARSE_REGEXP = /([^:]+):?(\d*)/;

export default class TestCommand extends Command {
	static get name() {
		return "test";
	}

	async execute() {
		const level = Level.current;

		try {
			this._setUpHyperlinkProvider();

			const context = level.test?.context;
			const $ = testContext[context]?.prepare(level) || {};

			let warnings = [];
			try {
				warnings = testContext[context]?.getWarnings(level);
			} catch (e) {}

			const overallResult = { allGreen: true };
			const hasMultipleTests = _.keys(level.tests).length > 1;

			const testFiles = _.keys(level.tests);
			for (let fileName of testFiles) {
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

			if (!_.isEmpty(warnings)) {
				if (this._isVerbose) await this._printWarnings(warnings);
				else
					await this._terminal.writeln(
						locales.get(
							warnings.some((it) => it.lint.some((it) => it.severity === ERROR))
								? "tests_errors_found"
								: "tests_warnings_found"
						)
					);
			}

			if (overallResult.allGreen) {
				await this._terminal.writeln(locales.get("tests_success"));
				await this._terminal.waitForKey();
				level.advance();
			} else {
				await this._terminal.writeln(locales.get("tests_failure"));

				if (this._isVerbose) {
					await this._terminal.waitForKey();
				} else {
					await this._terminal.writehlln(
						locales.get("tests_more"),
						theme.COMMENT
					);
				}
			}
		} finally {
			this._onClose();
		}
	}

	onStop() {
		this._onClose();

		return true;
	}

	_setUpHyperlinkProvider() {
		const handler = (__, text) => {
			if (this._hasEnded) return;
			const matches = text.match(LOCATION_PARSE_REGEXP);
			const filePath = matches[1];
			const lineNumber = parseInt(matches[2]);

			store.dispatch.savedata.openFile(filePath);
			if (_.isFinite(lineNumber))
				bus.emit("highlight", { line: lineNumber - 1 });
		};
		this._linkProvider = this._terminal.registerLinkProvider(
			LOCATION_DETECT_REGEXP,
			handler
		);
		this._linkProvider.end = () => {
			this._linkProvider.dispose();
			this._hasEnded = true;
		};
	}

	_onClose() {
		if (this._linkProvider) this._linkProvider.end();
	}

	async _printResult(result, overallResult) {
		const emoji = result.passed ? "✔️ " : "❌ ";

		if (!result.passed) {
			await this._terminal.newline();
			overallResult.allGreen = false;
		}

		await this._terminal.writehlln(`${emoji} ${result.name}`);

		if (!result.passed) {
			if (this._isVerbose && result.stack?.location) {
				await this._terminal.writeln(
					`📌  ${result.stack.location.filePath}:${result.stack.location.lineNumber} 📌`,
					theme.ACCENT
				);
			}
			await this._terminal.writeln(result.reason, theme.ERROR);

			if (this._isVerbose) {
				if (result.stack != null)
					await this._terminal.writeln(result.stack.trace, theme.ERROR);

				await this._terminal.writeln("----------", theme.ACCENT);
				await this._terminal.writeln(
					cliCodeHighlighter.highlight(result.testCode)
				);
				await this._terminal.writeln("----------", theme.ACCENT);
			}
		}
	}

	async _printWarnings(warnings) {
		for (let { fileName, lint } of warnings) {
			await this._terminal.writeln(`📌  ${fileName} 📌`, theme.ACCENT);

			for (let warning of lint) {
				const symbol = warning.severity === ERROR ? "🚫 " : "⚠️ ";
				const color = warning.severity === ERROR ? theme.ERROR : theme.WARNING;

				await this._terminal.writeln(
					`${symbol} ${theme.SYSTEM(`(:${warning.line})`)} ${color(
						warning.message
					)}`
				);
			}
		}

		await this._terminal.newline();
	}

	get _isVerbose() {
		return this._includes("-v");
	}
}
