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
		const parsedPath = $path.parse(filePath);
		let content = filesystem.read(filePath);

		let matches, isValid;
		do {
			matches =
				content.match(SINGLE_IMPORTS[0]) || content.match(SINGLE_IMPORTS[1]); // TODO: CHECK OTHER REGEXPS
			isValid = matches && matches.length === 3;

			if (isValid) {
				const defaultExport = matches[1];
				const relativePath = matches[2];

				process.$setCwd(parsedPath.dir);
				const absolutePath = $path.resolve(relativePath);
				// TODO: CHECK WHETHER FILE EXISTS

				const module =
					modules[absolutePath] || this._compile(absolutePath, modules);
				modules[absolutePath] = module;

				content = content.replace(
					SINGLE_IMPORTS[0],
					`const ${defaultExport} = (await import("${module}")).default`
				);
			}
		} while (isValid);

		if (filePath === "/code/index.js") console.log(content); // TODO: REMOVE

		return createModule(content);
	},
};
