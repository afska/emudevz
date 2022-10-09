import decorator from "./decorator";

export default {
	highlightLine(ref, code, lineNumber) {
		this.clear(ref, code);

		const { line, index } = this.findLine(code, lineNumber);
		this.decorate(ref, index, index + line.length);
	},

	...decorator(
		"cm-highlight",
		"line",
		"rgba(98, 112, 128, 0.5) !important",
		(r) => r.from,
		(r) => r.from
	),
};
