import _ from "lodash";
import { moduleEval } from "../../../../utils/eval";

export default {
	prepare(level) {
		let code = level.content;
		if (_.isObject(code)) code = this._processImports(code.index);

		return {
			evaluate() {
				return moduleEval(code);
			},
		};
	},

	_processImports(index) {
		console.log("PROCESSING IMPORTS OF", index);
		return index;
	},
};
