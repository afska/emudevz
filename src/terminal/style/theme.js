const DEFAULT_COLOR_ID = 255;

const colorTag = (id) => `\u001b[38;5;${id}m`;
const bgColorTag = (id) => `\u001b[${id}m`;
const color = (id) => (text) =>
	colorTag(id) + text + colorTag(DEFAULT_COLOR_ID);
const bgColor = (id) => (text) => bgColorTag(id) + text + bgColorTag(0);

export default {
	NORMAL: (x) => x,
	ACCENT: color(180),
	SYSTEM: color(45),
	ERROR: color(202),
	COMMENT: color(230),
	MESSAGE: color(111),
	INPUT: color(207),

	BG_NEW: bgColor(44),
};
