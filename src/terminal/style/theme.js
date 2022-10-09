const DEFAULT_COLOR_ID = 255;

const colorTag = (id) => `\u001b[38;5;${id}m`;
const color = (id) => (text) =>
	colorTag(id) + text + colorTag(DEFAULT_COLOR_ID);

export default {
	NORMAL: (x) => x,
	ACCENT: color(180),
	SYSTEM: color(45),
	ERROR: color(202),
	COMMENT: color(230),
	MESSAGE: color(111),
	INPUT: color(207),
};
