import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

const highlightMark = Decoration.line({ class: "cm-highlight" });

const highlightTheme = EditorView.baseTheme({
	".cm-highlight": { background: "rgba(98, 112, 128, 0.5) !important" },
});

const createEffect = () =>
	StateEffect.define({
		map: ({ from, to }, change) => ({
			from: change.mapPos(from),
			to: change.mapPos(to),
		}),
	});

const addHighlight = createEffect();
const removeHighlight = createEffect();

function addRange(ranges, r) {
	return ranges.update({
		add: [highlightMark.range(r.from, r.from)],
		// (ignore `to` for full line highlight)
	});
}

function cutRange(ranges, r) {
	const leftover = [];
	ranges.between(r.from, r.to, (from, to, deco) => {
		if (from < r.from) leftover.push(deco.range(from, r.from));
		if (to > r.to) leftover.push(deco.range(r.to, to));
	});
	return ranges.update({
		filterFrom: r.from,
		filterTo: r.to,
		filter: () => false,
		add: leftover,
	});
}

const highlightField = StateField.define({
	create() {
		return Decoration.none;
	},
	update(highlights, tr) {
		highlights = highlights.map(tr.changes);
		for (let e of tr.effects)
			if (e.is(addHighlight)) {
				highlights = addRange(highlights, e.value);
			} else if (e.is(removeHighlight))
				highlights = cutRange(highlights, e.value);
		return highlights;
	},
	provide: (f) => EditorView.decorations.from(f),
});

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

	clear(ref, code) {
		this.unhighlight(ref, 0, code.length);
	},

	highlight({ view }, from, to) {
		const effects = [addHighlight.of({ from, to })];

		if (!view.state.field(highlightField, false))
			effects.push(
				StateEffect.appendConfig.of([highlightField, highlightTheme])
			);

		view.dispatch({ effects });
	},

	unhighlight({ view }, from, to) {
		const effects = [removeHighlight.of({ from, to })];

		if (!view.state.field(highlightField, false))
			effects.push(
				StateEffect.appendConfig.of([highlightField, highlightTheme])
			);

		view.dispatch({ effects });
	},
};
