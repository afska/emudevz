import _escapeStringRegexp_ from "escape-string-regexp";
import _sinon_ from "sinon";
import _sinonChai_ from "sinon-chai";
import _ from "lodash";
import _Book_ from "../../../level/Book";
import _Level_ from "../../../level/Level";
import _locales_ from "../../../locales";
import { evaluateModule as _evaluateModule_ } from "../../../utils/eval";
import _chai_ from "./chai";

export default {
	async test(_code_, $ = {}) {
		let _before_ = null;
		let _after_ = null;
		const _tests_ = [];

		// eslint-disable-next-line
		const Level = _Level_;
		// eslint-disable-next-line
		const Book = _Book_;

		// eslint-disable-next-line
		const beforeEach = (run) => {
			_before_ = run;
		};

		// eslint-disable-next-line
		const afterEach = (run) => {
			_after_ = null;
		};

		// eslint-disable-next-line
		const it = (name, test) => {
			const testDefinition = {
				name,
				test,
			};

			_tests_.push(testDefinition);

			return (options) => {
				testDefinition.name = options.locales?.[_locales_.language] || name;

				if (options.use && !options.use(_Level_.current, _Book_.current))
					_tests_.pop();
			};
		};

		// eslint-disable-next-line
		const expect = _chai_.expect;
		// eslint-disable-next-line
		const should = _chai_.should();
		_chai_.use(_sinonChai_);
		// eslint-disable-next-line
		const sinon = _sinon_;

		// eslint-disable-next-line
		const evaluateModule = _evaluateModule_;

		eval(_code_);

		let results = [];
		for (let { name, test } of _tests_) {
			try {
				if (_before_) await _before_();
				await test();
				if (_after_) await _after_();
				results.push({ name, passed: true });
			} catch (e) {
				let testCode = test.toString();
				const isUserCode = e.stack != null && e.stack.includes("blob:");
				let testErrorLine =
					e.stack != null && e.stack.match(/<anonymous>:(\d+):\d+/);
				if (testErrorLine != null)
					testCode = this._markExactErrorLine(testErrorLine, _code_, testCode);

				results.push({
					name,
					passed: false,
					testCode,
					reason: e?.message || e?.toString() || "?",
					stack:
						isUserCode && $.modules != null
							? this._buildStack(e.stack, $.modules)
							: null,
				});
			}
		}

		return _.orderBy(results, "passed", "desc");
	},

	_buildStack(originalTrace, modules) {
		let trace = originalTrace
			.split("\n")
			.filter((it) => it.includes("blob:"))
			.join("\n");

		let location = null;
		_.forEach(modules, (module, filePath) => {
			const regexp = new RegExp(_escapeStringRegexp_(module), "g");
			const index = trace.search(regexp);

			// find error location (file + line)
			if (location == null && index > -1) {
				const endIndex = index + module.length;
				if (trace[endIndex] === ":") {
					const matches = trace.slice(endIndex).match(/\b(\d+)\b/);
					if (matches.length === 2) {
						const lineNumber = parseInt(matches[1]);
						location = {
							filePath,
							lineNumber,
						};
					}
				}
			}

			// replace blob with local file name
			trace = trace.replace(regexp, filePath);
		});

		return { trace, location };
	},

	_markExactErrorLine(testErrorLine, _code_, testCode) {
		const lineNumber = parseInt(testErrorLine[1]) - 1;
		const exactLine = _code_.split("\n")[lineNumber]?.trim();
		if (exactLine == null) return testCode;

		const startIndex = _code_.indexOf(testCode);
		const testTotalLines = testCode.split("\n").length;

		const newCode = _code_
			.split("\n")
			.map((line, i) => {
				return i === lineNumber ? `${line} /*💥  ❗ 💥 */` : line;
			})
			.join("\n");

		return newCode
			.slice(startIndex)
			.split("\n")
			.slice(0, testTotalLines)
			.join("\n");
	},
};
