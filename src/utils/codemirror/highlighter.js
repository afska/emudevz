import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

export default (
	className,
	type,
	background,
	from = (r) => r.from,
	to = (r) => r.to
) => {
	const highlightMark = Decoration[type]({ class: className });

	const highlightTheme = EditorView.baseTheme({
		[`.${className}`]: { background },
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
			add: [highlightMark.range(from(r), to(r))],
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

	return {
		highlight({ view }, from, to) {
			if (view == null) return;
			const effects = [addHighlight.of({ from, to })];

			if (!view.state.field(highlightField, false))
				effects.push(
					StateEffect.appendConfig.of([highlightField, highlightTheme])
				);

			view.dispatch({ effects });
		},

		unhighlight({ view }, from, to) {
			if (view == null) return;
			const effects = [removeHighlight.of({ from, to })];

			if (!view.state.field(highlightField, false))
				effects.push(
					StateEffect.appendConfig.of([highlightField, highlightTheme])
				);

			view.dispatch({ effects });
		},

		clear(ref, code) {
			this.unhighlight(ref, 0, code.length);
		},
	};
};
