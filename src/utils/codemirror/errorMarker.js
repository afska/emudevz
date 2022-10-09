import decorator from "./decorator";

export default {
	markError(ref, code, from, to) {
		this.clear(ref, code);
		if (to > from && code.length >= to) this.decorate(ref, from, to);
	},

	...decorator("cm-error", "mark", "rgba(232, 67, 49, 0.5)"),
};
