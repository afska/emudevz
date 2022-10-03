import { runner } from "../../../../utils/nes";

export default {
	CODE_ADDRESS: runner.CODE_ADDRESS,

	prepare(level, code = level.content) {
		return {
			compile() {
				const preCode = level.code[level.test.precode];
				return runner.create(code, preCode);
			},
		};
	},
};
