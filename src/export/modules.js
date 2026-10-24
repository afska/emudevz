import { parse } from "acorn";
import $path from "path-browserify-esm";

export default function exportModules(read, main = "/code/index.js") {
	const files = {};

	const visit = (path) => {
		if (path in files) return;

		const source = read(path);
		const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
		const imports = ast.body
			.filter((node) => node.source)
			.map((node) => node.source);

		files[path] = source;

		for (const node of imports.reverse()) {
			const specifier = node.value;

			const target = $path.resolve(
				$path.dirname(path),
				specifier.endsWith(".js") ? specifier : `${specifier}.js`
			);
			visit(target);

			let relative = $path.relative($path.dirname(path), target);
			if (!relative.startsWith("../")) relative = `./${relative}`;
			relative = relative.split("/").map(encodeURIComponent).join("/");
			files[path] =
				files[path].slice(0, node.start) +
				JSON.stringify(relative) +
				files[path].slice(node.end);
		}
	};

	visit(main);

	return Object.fromEntries(
		Object.entries(files).map(([path, source]) => [`emulator${path}`, source])
	);
}
