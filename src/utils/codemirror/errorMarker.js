import highlighter from "./highlighter";

export default {
	markError(ref, code, from, to) {
		this.clear(ref, code);
		if (to > from && code.length > to) this.highlight(ref, from, to);
	},

	...highlighter("cm-error", "mark", "rgba(232, 67, 49, 0.5)"),
};
