const $path = require("path");
const sort = require("./_sort");

function resolveDictionaryPath(cliArg) {
	if (cliArg) return cliArg;
	return $path.join(process.cwd(), "src/data/dictionary.jsx");
}

async function main() {
	const target = resolveDictionaryPath(process.argv[2]);
	try {
		const { count, changed } = sort.sortFileByPropertyObject(target, "entries");
		if (changed) {
			console.log(
				`✅  Sorted ${count} entries in: ${$path.relative(
					process.cwd(),
					target
				)}`
			);
		} else {
			console.log(
				`ℹ️  Already sorted: ${$path.relative(
					process.cwd(),
					target
				)} (${count} entries)`
			);
		}
	} catch (e) {
		console.error("❌  " + e.message);
		process.exit(1);
	}
}

main();
