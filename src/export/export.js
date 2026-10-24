import JSZip from "jszip";
import html from "./index.html?raw";
import exportModules from "./modules";

const sources = import.meta.glob(
	["./README.md", "./.nojekyll", "./frontend/**/*.js", "./css/*.css"],
	{
		eager: true,
		query: "?raw",
		import: "default",
	}
);

const assets = import.meta.glob(["./css/fonts/*.woff2", "./favicon.ico"], {
	eager: true,
	query: "?inline",
	import: "default",
});

export default async function exportEmulator(read) {
	const zip = new JSZip();
	zip.file("index.html", html);

	// e.g. "./frontend/App.js" -> "frontend/App.js"
	for (const [path, source] of Object.entries(sources))
		zip.file(path.replace("./", ""), source);

	// e.g. "data:font/woff2;base64,d09GMg..." -> "d09GMg..."
	for (const [path, data] of Object.entries(assets))
		zip.file(path.replace("./", ""), data.split(",")[1], { base64: true });

	for (const [path, source] of Object.entries(exportModules(read)))
		zip.file(path, source);

	return zip.generateAsync({ type: "uint8array" });
}
