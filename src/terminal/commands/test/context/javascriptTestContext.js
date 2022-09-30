import { moduleEval } from "../../../../utils/eval";

export default {
	prepare(level) {
		const code = level.content;

		return {
			evaluate() {
				return moduleEval(code);
			},
		};
	},
};
