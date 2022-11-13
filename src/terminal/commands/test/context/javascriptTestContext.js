import { Linter } from "eslint-linter-browserify";
import $path from "path";
import _ from "lodash";
import filesystem from "../../../../filesystem";
import { esLintConfig } from "../../../../utils/codemirror";
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

		const $ = {
			modules: null,
			filesystem,
		};

		$.evaluate = (path = null) => {
			if (!_.isObject(code)) return moduleEval(code);

			const { module, modules } = this._compile(path ?? code.main);
			$.modules = modules;

			return evaluateModule(module);
		};

		return $;
	},

	getWarnings(level) {
		const code = level.content;
		if (!_.isObject(code)) return [];

		const { modules } = this._compile(code.main);
		const fileNames = _(modules).keys().sort().value();

		return fileNames
			.map((fileName) => {
				const linter = new Linter();

				return {
					fileName,
					lint: linter.verify(filesystem.read(fileName), esLintConfig, {
						filename: fileName,
					}),
				};
			})
			.filter((it) => !_.isEmpty(it.lint));
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

		const module = createModule(context.content);
		modules[filePath] = module;
		return { module, modules };
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
					modules[absolutePath] || this._compile(absolutePath, modules).module;

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
		const absolutePath = filesystem.resolve(relativePath, parsedPath.dir);

		try {
			const stat = filesystem.stat(absolutePath);
			if (stat.isDirectory) throw new Error("invalid");
		} catch (e) {
			throw new Error(
				`Import failed (📌  ${filePath} 📌 ):\n  => ${matches[0]}`
			);
		}

		return absolutePath;
	},
};
