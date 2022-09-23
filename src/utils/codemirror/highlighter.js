import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

const highlightMark = Decoration.mark({ class: "cm-highlight" });

const highlightTheme = EditorView.baseTheme({
	".cm-highlight": { background: "#627080" },
});

const addHighlight = StateEffect.define({
	map: ({ from, to }, change) => ({
		from: change.mapPos(from),
		to: change.mapPos(to),
	}),
});

const removeHighlight = StateEffect.define({
	map: ({ from, to }, change) => ({
		from: change.mapPos(from),
		to: change.mapPos(to),
	}),
});

const highlightField = StateField.define({
	create() {
		return Decoration.none;
	},
	update(highlights, tr) {
		highlights = highlights.map(tr.changes);
		for (let e of tr.effects)
			if (e.is(addHighlight)) {
				highlights = highlights.update({
					add: [highlightMark.range(e.value.from, e.value.to)],
				});
			} else if (e.is(removeHighlight)); // TODO: IMPLEMENT
		return highlights;
	},
	provide: (f) => EditorView.decorations.from(f),
});

export default {
	highlight({ view }, from, to) {
		const effects = [addHighlight.of({ from, to })];

		if (!view.state.field(highlightField, false))
			effects.push(
				StateEffect.appendConfig.of([highlightField, highlightTheme])
			);

		view.dispatch({ effects });
	},

	clear({ view }) {
		view.state.field(highlightField, false);
	},
};
