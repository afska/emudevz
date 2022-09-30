import { superEval } from "../../../../utils";

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
