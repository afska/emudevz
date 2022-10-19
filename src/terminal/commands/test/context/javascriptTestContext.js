import $path from "path";
import _ from "lodash";
import filesystem from "../../../../filesystem";
import {
	createModule,
	evaluateModule,
	moduleEval,
} from "../../../../utils/eval";

const IMPORT_EXTENSION = ".js";
const SINGLE_IMPORTS = [
	/^import (\w+) from "(.+)";?$/m,
	/^import (\w+) from '(.+)';?$/m,
];
const MULTI_IMPORTS = [
	/^import {([^}]+)} from "(.+)";?$/m,
	/^import {([^}]+)} from '(.+)';?$/m,
];
const MIXED_IMPORTS = [
	/^import (\w+), ?{([^}]+)} from "(.+)";?$/m,
	/^import (\w+), ?{([^}]+)} from '(.+)';?$/m,
];

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
			this._compileMultiImports(context, modules);
			this._compileMixedImports(context, modules);
		} while (context.hasImports);

		return createModule(context.content);
	},

	_compileSingleImports(context, modules) {
		return this._compileImports(
			context,
			modules,
			SINGLE_IMPORTS,
			3,
			(matches) => matches[2],
			(matches, module) =>
				`const ${matches[1]} = (await import("${module}")).default;`
		);
	},

	_compileMultiImports(context, modules) {
		return this._compileImports(
			context,
			modules,
			MULTI_IMPORTS,
			3,
			(matches) => matches[2],
			(matches, module) =>
				`const { ${matches[1]} } = await import("${module}");`
		);
	},

	_compileMixedImports(context, modules) {
		return this._compileImports(
			context,
			modules,
			MIXED_IMPORTS,
			4,
			(matches) => matches[3],
			(matches, module) =>
				`const ${matches[1]} = (await import("${module}")).default;` +
				"\n" +
				`const { ${matches[2]} } = await import("${module}");`
		);
	},

	_compileImports(
		context,
		modules,
		regexps,
		expectedMatches,
		getRelativePath,
		buildImport
	) {
		let found = false;

		for (let regexp of regexps) {
			context.matches = context.content.match(regexp);

			if (context.matches && context.matches.length === expectedMatches) {
				found = true;

				const relativePath = getRelativePath(context.matches);
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
					buildImport(context.matches, module)
				);
			}
		}

		context.hasImports = found;
	},

	_resolvePath(filePath, relativePath, matches) {
		if (!relativePath.endsWith(IMPORT_EXTENSION))
			relativePath += IMPORT_EXTENSION;

		const parsedPath = $path.parse(filePath);
		process.$setCwd(parsedPath.dir);
		const absolutePath = $path.resolve(relativePath);

		try {
			const stat = filesystem.stat(absolutePath);
			if (stat.isDirectory()) throw new Error("invalid");
		} catch (e) {
			throw new Error(`Import failed (\`${filePath}\`):\n  => ${matches[0]}`);
		}

		return absolutePath;
	},
};
