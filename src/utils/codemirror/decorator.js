import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

export default (
	className,
	type,
	background,
	from = (r) => r.from,
	to = (r) => r.to
) => {
	const decorationMark = Decoration[type]({ class: className });

	const decorationTheme = EditorView.baseTheme({
		[`.${className}`]: { background },
	});

	const createEffect = () =>
		StateEffect.define({
			map: ({ from, to }, change) => ({
				from: change.mapPos(from),
				to: change.mapPos(to),
			}),
		});

	const addDecoration = createEffect();
	const removeDecoration = createEffect();

	function addRange(ranges, r) {
		return ranges.update({
			add: [decorationMark.range(from(r), to(r))],
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

	const decorationField = StateField.define({
		create() {
			return Decoration.none;
		},
		update(decorations, tr) {
			decorations = decorations.map(tr.changes);
			for (let e of tr.effects)
				if (e.is(addDecoration)) {
					decorations = addRange(decorations, e.value);
				} else if (e.is(removeDecoration))
					decorations = cutRange(decorations, e.value);
			return decorations;
		},
		provide: (f) => EditorView.decorations.from(f),
	});

	return {
		decorate(ref, from, to) {
			if (ref == null) return;
			const { view } = ref;
			const effects = [addDecoration.of({ from, to })];

			if (!view.state.field(decorationField, false))
				effects.push(
					StateEffect.appendConfig.of([decorationField, decorationTheme])
				);

			view.dispatch({ effects });
		},

		undecorate(ref, from, to) {
			if (ref == null) return;
			const { view } = ref;
			const effects = [removeDecoration.of({ from, to })];

			if (!view.state.field(decorationField, false))
				effects.push(
					StateEffect.appendConfig.of([decorationField, decorationTheme])
				);

			view.dispatch({ effects });
		},

		findLine(code, lineIndex) {
			const lines = code.split("\n");
			const line = lines[lineIndex];
			if (line == null) return { index: -1, line: "" };

			let index = 0;
			for (let l of lines.slice(0, lineIndex)) index += l.length + 1;

			return { line, index };
		},

		clear(ref, code) {
			this.undecorate(ref, 0, code.length);
		},
	};
};
