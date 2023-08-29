import $path from "path";
import Drive from "../filesystem/Drive";
import CodeEditor from "./components/CodeEditor";
import TV from "./components/TV";

export default {
	".js": [CodeEditor, { language: "javascript" }],
	".asm": [CodeEditor, { language: "asm" }],
	".webp": [TV, { type: "media" }],
	".png": [TV, { type: "media" }],
	".md": [TV, { type: "markdown" }],
	".neees": [TV, { type: "rom", binary: true }],
	".nes": [TV, { type: "rom", binary: true }],

	getTabIcon(filePath) {
		if (filePath.startsWith(Drive.TMPL_DIR)) return "📑 ";

		return this.getOptions(filePath)[0].tabIcon;
	},

	getOptions(filePath) {
		const extension = $path.parse(filePath).ext.toLowerCase();
		return this[extension] ?? [CodeEditor, { language: "plaintext" }];
	},
};
