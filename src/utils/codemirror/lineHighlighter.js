import highlighter from "./highlighter";

export default {
	highlightLine(ref, code, lineNumber) {
		this.clear(ref, code);

		const lines = code.split("\n");
		const line = lines[lineNumber];
		if (line == null) return;

		let index = 0;
		for (let l of lines.slice(0, lineNumber)) index += l.length + 1;

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
