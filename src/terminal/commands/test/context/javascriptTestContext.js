import $path from "path";
import _ from "lodash";
import filesystem from "../../../../filesystem";
import {
	createModule,
	evaluateModule,
	moduleEval,
} from "../../../../utils/eval";

const SINGLE_IMPORTS = [
	/^import (\w+) from "(.+)";?$/m,
	/^import (\w+) from '(.+)';?$/m,
];
/*const MULTI_IMPORTS = [
	/^import {([^}]+)} from "(.+)";?$/m,
	/^import {([^}]+)} from '(.+)';?$/m,
];
const MIXED_IMPORTS = [
	/^import (\w+), ?{([^}]+)} from "(.+)";?$/m,
	/^import (\w+), ?{([^}]+)} from '(.+)';?$/m,
];*/

export default {
	prepare(level) {
		const code = level.content;
		const self = this;

		return {
			evaluate() {
				return _.isObject(code)
					? evaluateModule(self._compile(code.main))
					: moduleEval(code);
			},
		};
	},

	_compile(filePath, modules = {}) {
		const context = {
			filePath,
			content: filesystem.read(filePath),
			matches: null,
			hasImports: false,
		};

		do {
			this._compileSingleImports(context, modules);
		} while (context.hasImports);

		return createModule(context.content);
	},

	_compileSingleImports(context, modules) {
		let found = false;

		for (let regexp of SINGLE_IMPORTS) {
			context.matches = context.content.match(regexp);

			if (context.matches && context.matches.length === 3) {
				found = true;

				const defaultExport = context.matches[1];
				const relativePath = context.matches[2];
				const absolutePath = this._resolvePath(
					context.filePath,
					relativePath,
					context.matches
				);

				const module =
					modules[absolutePath] || this._compile(absolutePath, modules);
				modules[absolutePath] = module;

				context.content = context.content.replace(
					regexp,
					`const ${defaultExport} = (await import("${module}")).default`
				);
			}
		}

		context.hasImports = found;
	},

	_resolvePath(filePath, relativePath, matches) {
		const parsedPath = $path.parse(filePath);
		process.$setCwd(parsedPath.dir);
		const absolutePath = $path.resolve(relativePath);

		try {
			filesystem.stat(absolutePath);
		} catch (e) {
			throw new Error(`Invalid import (\`${filePath}\`):\n  => ${matches[0]}`);
		}

		return absolutePath;
	},
};
