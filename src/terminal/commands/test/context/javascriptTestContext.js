import escapeStringRegexp from "escape-string-regexp";
import { Linter } from "eslint-linter-browserify";
import $path from "path-browserify-esm";
import _ from "lodash";
import EmulatorBuilder from "../../../../EmulatorBuilder";
import filesystem from "../../../../filesystem";
import Level from "../../../../level/Level";
import { byte } from "../../../../utils";
import { esLintConfig } from "../../../../utils/codemirror";
import {
	createModule,
	evaluateModule,
	moduleEval,
} from "../../../../utils/eval";
import testHelpers from "./testHelpers";

const IMPORT_EXTENSION = ".js";
const SINGLE_IMPORTS = [
	/^ *import +(\w+) +from +"(.+)" *;?$/m,
	/^ *import +(\w+) +from +'(.+)' *;?$/m,
];
const MULTI_IMPORTS = [
	/^ *import +{([^}]+)} +from +"(.+)" *;?$/m,
	/^ *import +{([^}]+)} +from +'(.+)' *;?$/m,
];
const MIXED_IMPORTS = [
	/^ *import +(\w+), *{([^}]+)} +from +"(.+)" *;?$/m,
	/^ *import +(\w+), *{([^}]+)} +from +'(.+)' *;?$/m,
];
const ERROR = 2;

let BLOB_TO_PATH_MAP = {};

export default {
	prepare(level, withLastCode = false) {
		const code = level.content;

		const $ = {
			modules: null,
			EmulatorBuilder,
			testHelpers,
			filesystem,
			byte,
			lodash: _,
		};

		$.evaluate = (path = null) => {
			if (!_.isObject(code)) return moduleEval(code);

			const { module, modules } = this._compile(
				path ?? code.main,
				withLastCode
			);
			$.modules = modules;
			_.forEach(modules, (blobName, filePath) => {
				BLOB_TO_PATH_MAP[blobName] = filePath;
			});

			return evaluateModule(module);
		};

		return $;
	},

	getWarnings(level) {
		try {
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
		} catch (e) {
			console.error(e);
			const message = e?.message?.toLowerCase() || "?";

			if (message.includes("call stack")) {
				throw new Error(
					"There's some recursive stuff goin' on. Check your imports?"
				);
			} else {
				throw new Error("Something has gone very wrong!");
			}
		}
	},

	buildHTMLError(e) {
		try {
			let fullStack = this.buildStack(e);

			if (!fullStack) {
				const warnings = this.getWarnings(Level.current).filter((it) =>
					it.lint.some((lint) => lint.severity === ERROR)
				);
				if (!_.isEmpty(warnings)) {
					fullStack = {
						trace: warnings
							.map((it) => {
								const errors = it.lint
									.filter((lint) => lint.severity === ERROR)
									.map(
										(lint) =>
											`&nbsp;&nbsp;(:${lint.line}:${lint.column}) ${lint.message}`
									)
									.join("\n");

								return `\n📄 ${it.fileName}:\n` + errors;
							})
							.join("\n"),
					};
				}
			}

			return (
				(e?.message || "?") +
				(fullStack != null ? "\n" + fullStack.trace : "").replace(/\n/g, "<br>")
			);
		} catch (e) {
			return e?.message || "?";
		}
	},

	buildStack(error) {
		const isUserCode = error?.stack != null && error.stack.includes("blob:");
		if (!isUserCode) return null;
		const originalTrace = error.stack;

		const traceLines = originalTrace
			.split("\n")
			.filter((it) => it.includes("blob:"));
		const mainTraceLine = _.first(traceLines);
		let trace = traceLines.join("\n");

		let location = null;
		_.forEach(BLOB_TO_PATH_MAP, (filePath, module) => {
			const regexp = new RegExp(escapeStringRegexp(module), "g");

			// find error location (file + line)
			if (location == null) {
				const index = mainTraceLine.search(regexp);
				if (index > -1) {
					const endIndex = index + module.length;
					if (mainTraceLine[endIndex] === ":") {
						const matches = mainTraceLine.slice(endIndex).match(/\b(\d+)\b/);
						if (matches.length === 2) {
							const lineNumber = parseInt(matches[1]);
							location = {
								filePath,
								lineNumber,
							};
						}
					}
				}
			}

			// replace blob with local file name
			trace = trace.replace(regexp, filePath);
		});

		return { trace, location };
	},

	_compile(filePath, withLastCode = false, modules = {}) {
		const context = {
			filePath,
			content: filesystem.withSymlinks(!withLastCode, () =>
				filesystem.read(filePath)
			),
			matches: null,
			hasImports: false,
			withLastCode,
		};

		do {
			context.hasImports = false;
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
					context.matches,
					context.withLastCode
				);

				const module =
					modules[absolutePath] ||
					this._compile(absolutePath, context.withLastCode, modules).module;

				context.content = context.content.replace(
					regexp,
					buildImport(context.matches, module)
				);
			}
		}

		context.hasImports = context.hasImports || found;
	},

	_resolvePath(filePath, relativePath, matches, withLastCode) {
		if (!relativePath.endsWith(IMPORT_EXTENSION))
			relativePath += IMPORT_EXTENSION;

		const parsedPath = $path.parse(filePath);
		const absolutePath = filesystem.withSymlinks(!withLastCode, () =>
			filesystem.resolve(relativePath, parsedPath.dir)
		);

		try {
			const stat = filesystem.withSymlinks(!withLastCode, () =>
				filesystem.stat(absolutePath)
			);
			if (stat.isDirectory) throw new Error("Invalid");
		} catch (e) {
			throw new Error(
				`Import failed (📌  ${filePath} 📌 ):\n  => ${matches[0]}`
			);
		}

		return absolutePath;
	},
};
