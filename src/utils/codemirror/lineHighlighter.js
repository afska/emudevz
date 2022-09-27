import highlighter from "./highlighter";

export default {
	highlightLine(ref, code, lineNumber) {
		this.clear(ref, code);

		const { line, index } = this.findLine(code, lineNumber);
		this.highlight(ref, index, index + line.length);
	},

	...highlighter(
		"cm-highlight",
		"line",
		"rgba(98, 112, 128, 0.5) !important",
		(r) => r.from,
		(r) => r.from
	),
};
