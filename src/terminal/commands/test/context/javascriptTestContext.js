const superEval = (code) => {
	// eslint-disable-next-line
	const blob = URL.createObjectURL(
		new Blob([String.raw({ raw: code })], { type: "text/javascript" })
	);

	// - returns a promise
	// - the eval bypasses webpack's import system
	return eval("import(blob)");
};

export default {
	prepare(level) {
		const code = level.content;

		return {
			evaluate() {
				return superEval(code);
			},
		};
	},
};
