import $path from "path-browserify-esm";
import Drive from "../filesystem/Drive";
import CodeEditor from "./components/CodeEditor";
import TV from "./components/TV";
import { getActiveRomExtensions } from "./rom";

export default {
	getTabIcon(filePath) {
		if (filePath.startsWith(Drive.TMPL_DIR)) return "📑 ";

		return this.getOptions(filePath)[0].tabIcon;
	},

	getOptions(filePath) {
		const extension = $path.parse(filePath).ext.toLowerCase();

		if (getActiveRomExtensions().includes(extension))
			return [TV, { type: "rom", binary: true }];

		const map = {
			".js": [CodeEditor, { language: "javascript" }],
			".asm": [CodeEditor, { language: "asm" }],
			".webp": [TV, { type: "media" }],
			".png": [TV, { type: "media" }],
			".md": [TV, { type: "markdown" }],
		};

		return map[extension] ?? [CodeEditor, { language: "plaintext" }];
	},
};
