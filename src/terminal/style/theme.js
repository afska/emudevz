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
	IMAGE: (fileName) => {
		const level = Level.current;
		const content = (fileName && level?.media?.[fileName]) || null;
		if (!content) return;
		const rawBase64 = content.split(";base64,")[1];
		if (!rawBase64) return;

		const size = window.atob(rawBase64).length;
		return `]1337;File=inline=1;size=${size}:${rawBase64}`;
	},

	ACCENT: color(180),
	SYSTEM: color(45),
	ERROR: color(202),
	WARNING: color(214),
	COMMENT: color(230),
	MESSAGE: color(111),
	INPUT: color(207),

	BG_NEW: effect(45),
};
