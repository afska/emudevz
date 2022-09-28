import chai from "chai";
import _ from "lodash";

export default {
	async test(code, $ = {}) {
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
		const should = chai.should();

		eval(code);

		const results = await Promise.all(
			_tests_.map(async ({ name, test }) => {
				try {
					if (_before_) await _before_();
					await test();
					if (_after_) await _after_();
					return { name, passed: true };
				} catch (e) {
					const operator = e.operator != null ? `${e.operator} - ` : "";

					return {
						name,
						passed: false,
						testCode: test.toString(),
						reason: operator + e.message,
					};
				}
			})
		);

		return _.orderBy(results, "passed", "desc");
	},
};
