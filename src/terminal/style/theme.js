import { TERMINAL_ANSI_INDICES as THEME } from "../../gui/theme";
import Level from "../../level/Level";
import store from "../../store";
import { dlc, image as imageUtils } from "../../utils";

const RESET = {
	BOLD: 22,
	ITALIC: 23,
	UNDERLINE: 24,
	COLOR: 39,
	BG_COLOR: 49,
	EVERYTHING: 0,
};

const colorTag = (id) => `\u001b[38;5;${id}m`;
const effectTag = (id) => `\u001b[${id}m`;
const color = (id) => (text) => colorTag(id) + text + effectTag(RESET.COLOR);
const effect = (id, reset = RESET.EVERYTHING) => (text) =>
	effectTag(id) + text + effectTag(reset);

export default {
	NORMAL: (x) => x,
	BOLD: effect(1, RESET.BOLD),
	FAINT: effect(2, RESET.BOLD),
	ITALIC: effect(3, RESET.ITALIC),
	UNDERLINE: effect(4, RESET.UNDERLINE),
	IMAGE: (imageCommand) => {
		let [fileName, resolution] = imageCommand.split(";");
		if (resolution == null) resolution = "75%x100%";
		const [width, height] = resolution.split("x");
		let args = "";
		if (width != null && height != null)
			args = `;width=${width};height=${height}`;

		const level = Level.current;

		const state = store.getState();
		const invertTransparentImages =
			(dlc.installed() && state.savedata?.invertTransparentImages) || false;
		if (invertTransparentImages && fileName) {
			const invertedFileName = imageUtils.getInvertedPngPath(fileName);
			if (invertedFileName !== fileName && level?.media?.[invertedFileName])
				fileName = invertedFileName;
		}

		const content = (fileName && level?.media?.[fileName]) || null;
		if (!content) throw new Error(`Invalid image: ${fileName}`);
		const rawBase64 = content.split(";base64,")[1];
		if (!rawBase64) return;

		const size = window.atob(rawBase64).length;
		return `]1337;File=inline=1;size=${size}${args}:${rawBase64}`;
	},

	ACCENT: (txt) => color(THEME.accent)(txt),
	// ACCENT2: color(123),
	SYSTEM: (txt) => color(THEME.system)(txt),
	ERROR: (txt) => color(THEME.error)(txt),
	WARNING: (txt) => color(THEME.warning)(txt),
	COMMENT: (txt) => color(THEME.comment)(txt),
	MESSAGE: (txt) => color(THEME.message)(txt),
	INPUT: (txt) => color(THEME.input)(txt),
	DIFF_ADDED: (txt) => color(THEME.diffAdded)(txt),
	DIFF_REMOVED: (txt) => color(THEME.diffRemoved)(txt),
	DICTIONARY: (text) => {
		const shouldUnderline =
			Level.current.id === "getting-started-architecture" ||
			Level.current.id === "console-full-control";

		const coloredText = color(THEME.dictionary)(text);
		return shouldUnderline
			? effect(4, RESET.UNDERLINE)(coloredText)
			: coloredText;
	},

	BG_NEW: effect(45, RESET.BG_COLOR),
	BG_HIGHLIGHT: effect(40, RESET.BG_COLOR),
};
