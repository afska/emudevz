const fs = require("fs");
const $path = require("path");

const LEVELS_DIR = "src/data/levels";

const ANY = new Proxy(function () {}, {
	get: (__, key) => (key === Symbol.toPrimitive ? () => "" : ANY),
	apply: () => ANY,
	construct: () => ANY,
});

// Returns all the test definitions with their final names:
// [{ name, locales, file }]
module.exports = function getTests() {
	const tests = [];

	for (let file of fs.readdirSync(LEVELS_DIR, { recursive: true })) {
		if (!isTestFile(file)) continue;
		const filePath = $path.join(LEVELS_DIR, file);

		const it = (name) => {
			const test = { name, locales: null, file: filePath };
			tests.push(test);

			return (options = {}) => {
				test.locales = options.locales ?? null;
			};
		};

		const scope = new Proxy(
			{},
			{
				has: (__, key) => !(key in globalThis),
				get: (__, key) =>
					key === "it" ? it : key === Symbol.unscopables ? undefined : ANY,
			}
		);

		try {
			const source = fs.readFileSync(filePath, "utf8");
			new Function("scope", `with (scope) {\n${source}\n}`)(scope);
		} catch (err) {
			throw new Error(
				`Unable to read tests from: ${filePath} (${err.message})`
			);
		}
	}

	return tests;
};

function isTestFile(file) {
	const parts = file.split(/[\\/]/);
	if (!file.endsWith(".js")) return false;

	return (
		parts[0] === "$tests" ||
		parts[parts.length - 2] === "tests" ||
		file.endsWith(".test.js")
	);
}
