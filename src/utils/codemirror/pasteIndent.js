import { indentSelection } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

function stripCommonIndent(text, tabSize = 4) {
	const lines = text.replace(/\r\n/g, "\n").split("\n");
	if (lines.length <= 1) return text;

	// compute minimal indent (in space-equivalents) among non-empty lines
	let minIndent = Infinity;
	for (const line of lines) {
		if (line.trim() === "") continue;
		const match = line.match(/^[ \t]*/)?.[0] || "";
		let indent = 0;
		for (const ch of match) indent += ch === "\t" ? tabSize : 1;
		if (indent < minIndent) minIndent = indent;
	}
	if (minIndent === 0 || minIndent === Infinity) return text;

	// strip that much indent from each line
	return lines
		.map((line) => {
			if (line.trim() === "") return "";
			let removed = 0,
				i = 0;
			while (i < line.length && removed < minIndent) {
				const ch = line[i];
				if (ch === "\t") {
					removed += tabSize;
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
		if (
			view.state.facet(EditorState.readOnly) ||
			!view.state.facet(EditorView.editable)
		)
			return false;

		event.preventDefault();
		const raw = event.clipboardData.getData("text/plain");
		const normalized = stripCommonIndent(raw, view.state.tabSize ?? 4);

		const { from, to } = view.state.selection.main;

		// insert with the pasted block selected so indentSelection affects it
		view.dispatch({
			changes: { from, to, insert: normalized },
			selection: { anchor: from, head: from + normalized.length },
			userEvent: "input.paste",
		});

		const pasteStart = from;
		const pasteEnd = from + normalized.length;

		// defer indent so language services/extensions settle
		view.focus();
		requestAnimationFrame(() => {
			const sel = view.state.selection.main;
			const selStart = Math.min(sel.anchor, sel.head);
			const selEnd = Math.max(sel.anchor, sel.head);
			const overlapsPaste = selStart < pasteEnd && selEnd > pasteStart;

			if (overlapsPaste) {
				indentSelection(view);
				const s = view.state.selection.main;
				const end = Math.max(s.anchor, s.head);
				view.dispatch({ selection: { anchor: end }, scrollIntoView: true });
			}
		});

		return true;
	},
});
