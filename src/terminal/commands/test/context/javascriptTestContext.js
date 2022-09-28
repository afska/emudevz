export default {
	prepare(level) {
		const code = level.content;

		const result = eval(code);

		return {
			result,
		};
	},
};
