import _sinon_ from "sinon";
import _sinonChai_ from "sinon-chai";
import _ from "lodash";
import _Book_ from "../../../level/Book";
import _Level_ from "../../../level/Level";
import _locales_ from "../../../locales";
import { evaluateModule as _evaluateModule_ } from "../../../utils/eval";
import _chai_ from "./chai";
import testContext from "./context";

export default {
	async test(_code_, _testDefinition_, _debug_) {
		const {
			_before_,
			_beforeEach_,
			_afterEach_,
			_after_,
			_tests_,
		} = _testDefinition_;

		let results = [];
		let didBeforeRun = false;
		let didAfterRun = false;
		for (let { id, name, test } of _tests_) {
			for (let _i_ = 0; _i_ < 2; _i_++) {
				try {
					if (!didBeforeRun && _before_) {
						await _before_();
						didBeforeRun = true;
					}
					if (_beforeEach_) await _beforeEach_();
					if (_i_ === 1) debugger;
					await test();
					if (_afterEach_) await _afterEach_();
					if (!didAfterRun && _after_) {
						await _after_();
						didAfterRun = true;
					}

					results.push({ id, name, passed: true });
					break;
				} catch (e) {
					if (_i_ == 0 && _debug_) continue; // run again with debugger

					let testCode = test.toString();
					let testErrorLine =
						e.stack != null &&
						!e?.message?.startsWith("🐒") &&
						e.stack.match(/<anonymous>:(\d+):\d+/);
					if (testErrorLine != null)
						testCode = this._markExactErrorLine(
							testErrorLine,
							_code_,
							testCode
						);

					results.push({
						id,
						name,
						passed: false,
						testCode,
						reason: e?.message || e?.toString() || "?",
						fullStack: testContext.javascript.buildStack(e),
					});
					break;
				}
			}
		}

		return _.orderBy(results, "passed", "desc");
	},

	async getTestDefinition(_code_, $ = {}, _idProvider_ = { id: 0 }) {
		let _before_ = null;
		let _beforeEach_ = null;
		let _afterEach_ = null;
		let _after_ = null;
		const _tests_ = [];

		// eslint-disable-next-line
		const Book = _Book_;
		// eslint-disable-next-line
		const GLOBAL_LEVEL_ID = Book.current.getLevelDefinitionOf(
			_Level_.current.id
		).globalId;

		// eslint-disable-next-line
		const before = (run) => {
			_before_ = run;
		};

		// eslint-disable-next-line
		const beforeEach = (run) => {
			_beforeEach_ = run;
		};

		// eslint-disable-next-line
		const afterEach = (run) => {
			_afterEach_ = null;
		};

		// eslint-disable-next-line
		const after = (run) => {
			_after_ = null;
		};

		// eslint-disable-next-line
		const it = (name, test) => {
			const testDefinition = {
				id: ++_idProvider_.id,
				name,
				test,
			};

			_tests_.push(testDefinition);

			return (options = {}) => {
				testDefinition.name = options.locales?.[_locales_.language] || name;

				if (
					options.use &&
					!options.use({ id: GLOBAL_LEVEL_ID }, _Book_.current)
				)
					_tests_.pop();
			};
		};

		// eslint-disable-next-line
		const expect = _chai_.expect;
		// eslint-disable-next-line
		const should = _chai_.should();
		// eslint-disable-next-line
		_chai_.use(_sinonChai_);
		// eslint-disable-next-line
		const sinon = _sinon_;

		// eslint-disable-next-line
		const evaluateModule = _evaluateModule_;

		eval(_code_);

		return { _before_, _beforeEach_, _afterEach_, _after_, _tests_ };
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
				return i === lineNumber ? `\`!!\`${line}\`!!\`` : line;
			})
			.join("\n");

		return newCode
			.slice(startIndex)
			.split("\n")
			.slice(0, testTotalLines)
			.join("\n");
	},
};
