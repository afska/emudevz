import _chai_ from "chai";
import _escapeStringRegexp_ from "escape-string-regexp";
import _ from "lodash";

export default {
	async test(_code_, $ = {}) {
		let _before_ = null;
		let _after_ = null;
		const _tests_ = [];

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
			_tests_.push({ name, test });
		};

		// eslint-disable-next-line
		const expect = _chai_.expect;
		// eslint-disable-next-line
		const should = _chai_.should();

		eval(_code_);

		let results = [];
		for (let { name, test } of _tests_) {
			try {
				if (_before_) await _before_();
				await test();
				if (_after_) await _after_();
				results.push({ name, passed: true });
			} catch (e) {
				const isUserCode = e.stack != null && e.stack.includes("blob:");

				results.push({
					name,
					passed: false,
					testCode: test.toString(),
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
};
