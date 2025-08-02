import { indentSelection } from "@codemirror/commands";
import { EditorView } from "@codemirror/view";

function stripCommonIndent(text) {
	const lines = text.replace(/\r\n/g, "\n").split("\n");
	if (lines.length <= 1) return text;

	// compute minimal indent (in space-equivalents) among non-empty lines
	let minIndent = Infinity;
	for (const line of lines) {
		if (line.trim() === "") continue;
		const match = line.match(/^[ \t]*/)?.[0] || "";
		let indent = 0;
		for (const ch of match) {
			if (ch === "\t") indent += 4;
			else indent += 1;
		}
		if (indent < minIndent) minIndent = indent;
	}
	if (minIndent === 0 || minIndent === Infinity) return text;

	// strip that much indent from each line
	return lines
		.map((line) => {
			if (line.trim() === "") return "";
			let removed = 0;
			let i = 0;
			while (i < line.length && removed < minIndent) {
				const ch = line[i];
				if (ch === "\t") {
					removed += 4;
					i += 1;
				} else if (ch === " ") {
					removed += 1;
					i += 1;
				} else break;
			}
			return line.slice(i);
		})
		.join("\n");
}

export default EditorView.domEventHandlers({
	paste(event, view) {
		event.preventDefault();
		const raw = event.clipboardData.getData("text/plain");
		const normalized = stripCommonIndent(raw);
		const { from, to } = view.state.selection.main;

		// insert with the pasted block selected so indentSelection affects it
		view.dispatch({
			changes: { from, to, insert: normalized },
			selection: { anchor: from, head: from + normalized.length },
			userEvent: "input.paste",
		});

		// indent the inserted block, then collapse cursor to its end
		setTimeout(() => {
			indentSelection(view);
			const sel = view.state.selection.main;
			const end = Math.max(sel.anchor, sel.head);
			view.dispatch({
				selection: { anchor: end },
				scrollIntoView: true,
			});
		});

		return true;
	},
});
