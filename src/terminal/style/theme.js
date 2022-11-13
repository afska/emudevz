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

	ACCENT: color(180),
	SYSTEM: color(45),
	ERROR: color(202),
	WARNING: color(214),
	COMMENT: color(230),
	MESSAGE: color(111),
	INPUT: color(207),

	BG_NEW: effect(45),
};
