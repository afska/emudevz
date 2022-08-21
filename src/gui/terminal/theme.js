const DEFAULT_COLOR_ID = 255;

const colorTag = (id) => `\u001b[38;5;${id}m`;
const color = (id) => (text) =>
	colorTag(id) + text + colorTag(DEFAULT_COLOR_ID);

export default {
	NORMAL: (x) => x,
	ACCENT: color(180),
	SYSTEM: color(45),
};
