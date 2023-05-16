import _ from "lodash";
import Book from "../../../level/Book";
import Level from "../../../level/Level";
import locales from "../../../locales";
import store from "../../../store";
import { analytics, bus } from "../../../utils";
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
			const inherit = level.test?.inherit;
			let mainTestFile = level.test?.mainTestFile;

			let warnings = [];
			try {
				warnings = testContext[context]?.getWarnings(level);
			} catch (e) {}

			const overallResult = { allGreen: true, passCount: 0, failCount: 0 };
			const hasMultipleTestFiles =
				_.keys(level.tests).length > 1 && !this._targetId;
			const winOnTestPass = !level.memory.chat.winOnEnd;

			let testFiles = _.sortBy(_.keys(level.tests));
			if (inherit != null) testFiles = inherit;

			if (mainTestFile != null && testFiles.includes(mainTestFile))
				testFiles = [..._.without(testFiles, mainTestFile), mainTestFile];
			else mainTestFile = null;

			const testDefinitions = await this._getTestDefinitions(
				level,
				$,
				testFiles
			);

			for (let testDefinition of testDefinitions) {
				const fileName = testDefinition.fileName;
				const isMainTestFile =
					!hasMultipleTestFiles ||
					mainTestFile == null ||
					fileName === mainTestFile;
				const test = level.tests[fileName];

				if (hasMultipleTestFiles)
					await this._terminal.writeln(
						locales.get("testing") + theme.MESSAGE(fileName) + "..."
					);

				const results = await framework.test(test, testDefinition);

				for (let result of results) {
					if (isMainTestFile || !result.passed)
						await this._printResult(result, overallResult);
				}
				if (!isMainTestFile && _.every(results, "passed"))
					await this._terminal.writeln("✔️ ");

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

			if (!this._targetId) {
				const levelDefinition = Book.current.getLevelDefinitionOf(level.id);
				analytics.track("test_results", {
					levelId: level.id,
					levelHumanId: levelDefinition.humanId,
					levelGlobalId: levelDefinition.globalId,
					levelName: level.name.en,
					passed: overallResult.allGreen,
					passCount: overallResult.passCount,
					failCount: overallResult.failCount,
				});
			}

			if (overallResult.allGreen) {
				if (winOnTestPass && !this._targetId) {
					await this._terminal.writeln(locales.get("tests_success_continue"));
					await this._terminal.waitForKey();
					level.advance();
				} else {
					await this._terminal.writeln(locales.get("tests_success"));
				}
			} else {
				await this._terminal.writeln(locales.get("tests_failure"));

				if (this._isVerbose) {
					await this._terminal.writeln(
						locales.get("press_any_key_to_continue"),
						theme.SYSTEM
					);
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

	async _getTestDefinitions(level, $, testFiles) {
		const testDefinitions = [];

		const idProvider = { id: 0 };
		for (let fileName of testFiles) {
			const test = level.tests[fileName];
			let { _before_, _after_, _tests_ } = await framework.getTestDefinition(
				test,
				$,
				idProvider
			);

			if (this._targetId)
				_tests_ = _tests_.filter((it) => it.id === this._targetId);

			if (!_.isEmpty(_tests_))
				testDefinitions.push({
					fileName,
					_before_,
					_after_,
					_tests_,
				});
		}

		return testDefinitions;
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
			overallResult.failCount++;
		} else overallResult.passCount++;

		await this._terminal.writehlln(`${emoji} (~${result.id}~) ${result.name}`);

		if (!result.passed) {
			if (this._isVerbose && result.fullStack?.location) {
				await this._terminal.writeln(
					`📌  ${result.fullStack.location.filePath}:${result.fullStack.location.lineNumber} 📌`,
					theme.ACCENT
				);
			}
			await this._terminal.writeln(result.reason, theme.ERROR);

			if (this._isVerbose) {
				if (result.fullStack != null)
					await this._terminal.writeln(result.fullStack.trace, theme.ERROR);

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

	get _targetId() {
		const argument = parseInt(
			this._args.filter((it) => it.toLowerCase() !== "-v")[0]
		);
		return _.isFinite(argument) ? argument : null;
	}

	get _isVerbose() {
		return this._includes("-v");
	}
}
