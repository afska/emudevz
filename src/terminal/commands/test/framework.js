import chai from "chai";
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
		const expect = chai.expect;
		// eslint-disable-next-line
		const should = chai.should();

		eval(_code_);

		let results = [];
		for (let { name, test } of _tests_) {
			try {
				if (_before_) await _before_();
				await test();
				if (_after_) await _after_();
				results.push({ name, passed: true });
			} catch (e) {
				results.push({
					name,
					passed: false,
					testCode: test.toString(),
					reason: e.message,
				});
			}
		}

		return _.orderBy(results, "passed", "desc");
	},
};
