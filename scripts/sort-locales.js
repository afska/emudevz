const $path = require("path");
const sort = require("./_sort");

function resolveLocalePath(arg) {
	if (!arg) return null;
	if (arg.endsWith(".js"))
		return $path.isAbsolute(arg) ? arg : $path.join(process.cwd(), arg);
	return $path.join(process.cwd(), `src/locales/${arg}.js`);
}

async function main() {
	const arg = process.argv[2];
	try {
		if (!arg) {
			const targets = [
				$path.join(process.cwd(), "src/locales/en.js"),
				$path.join(process.cwd(), "src/locales/es.js"),
			];
			for (const target of targets) {
				const { count, changed } = sort.sortFileByExportDefaultObject(target);
				if (changed) {
					console.log(
						`✅  Sorted ${count} keys in: ${$path.relative(
							process.cwd(),
							target
						)}`
					);
				} else {
					console.log(
						`ℹ️  Already sorted: ${$path.relative(
							process.cwd(),
							target
						)} (${count} keys)`
					);
				}
			}
			return;
		}

		const target = resolveLocalePath(arg);
		const { count, changed } = sort.sortFileByExportDefaultObject(target);
		if (changed) {
			console.log(
				`✅  Sorted ${count} keys in: ${$path.relative(process.cwd(), target)}`
			);
		} else {
			console.log(
				`ℹ️  Already sorted: ${$path.relative(
					process.cwd(),
					target
				)} (${count} keys)`
			);
		}
	} catch (e) {
		console.error("❌  " + e.message);
		process.exit(1);
	}
}

main();
