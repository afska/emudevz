const fs = require("fs");
const JSON5 = require("json5");
const prettier = require("prettier");

const { compare } = new Intl.Collator("en", { sensitivity: "base" });

module.exports = function sortFiles(files) {
	try {
		for (const file of files) {
			const source = fs.readFileSync(file, "utf8");
			const match = source.match(/^export\s+default\s+({[\s\S]*});?\s*$/);
			if (!match)
				throw new Error(`Expected a default-exported object: ${file}`);

			const entries = Object.entries(JSON5.parse(match[1])).sort(([a], [b]) =>
				compare(a, b)
			);
			const sorted = JSON.stringify(Object.fromEntries(entries), null, "\t");
			const output = prettier.format(`export default ${sorted};`, {
				...prettier.resolveConfig.sync(file),
				parser: "babel",
			});
			const changed = source !== output;
			if (changed) fs.writeFileSync(file, output);
			console.log(
				`${changed ? "✅  Sorted" : "ℹ️  Already sorted"}: ${file} (${
					entries.length
				} keys)`
			);
		}
	} catch (error) {
		console.error("❌  " + error.message);
		process.exitCode = 1;
	}
};
