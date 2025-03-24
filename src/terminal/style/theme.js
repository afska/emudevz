import Level from "../../level/Level";

const DEFAULT_COLOR_ID = 255;

const colorTag = (id) => `\u001b[38;5;${id}m`;
const effectTag = (id) => `\u001b[${id}m`;
const color = (id) => (text) =>
	colorTag(id) + text + colorTag(DEFAULT_COLOR_ID);
const effect = (id) => (text) => effectTag(id) + text + effectTag(0);

export default {
	NORMAL: (x) => x,
	BOLD: effect(1),
	FAINT: effect(2),
	ITALIC: effect(3),
	UNDERLINE: effect(4),
	IMAGE: (imageCommand) => {
		let [fileName, resolution] = imageCommand.split(";");
		if (resolution == null) resolution = "75%x100%";
		const [width, height] = resolution.split("x");
		let args = "";
		if (width != null && height != null)
			args = `;width=${width};height=${height}`;

		const level = Level.current;
		const content = (fileName && level?.media?.[fileName]) || null;
		if (!content) throw new Error(`Invalid image: ${fileName}`);
		const rawBase64 = content.split(";base64,")[1];
		if (!rawBase64) return;

		const size = window.atob(rawBase64).length;
		return `]1337;File=inline=1;size=${size}${args}:${rawBase64}`;
	},

	ACCENT: color(180),
	ACCENT2: color(121),
	SYSTEM: color(45),
	ERROR: color(202),
	WARNING: color(214),
	COMMENT: color(230),
	MESSAGE: color(111),
	INPUT: color(207),
	DICTIONARY: (text) => effect(4)(color(216)(text)),

	HIGHLIGHTED_BOLD: (text) =>
		effectTag(40) + effectTag(1) + text + effectTag(0) + effectTag(40),
	BG_NEW: effect(45),
	BG_HIGHLIGHT: effect(40),
	BG_HIGHLIGHT_START: () => effectTag(40),
	BG_HIGHLIGHT_END: () => effectTag(0),
};
