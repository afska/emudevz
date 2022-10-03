import { runner } from "../../../../utils/nes";

const PRE_CODE_FILE = "pre.asm";

export default {
	CODE_ADDRESS: runner.CODE_ADDRESS,

	prepare(level, code = level.content) {
		return {
			compile() {
				const preCode = level.code[PRE_CODE_FILE];
				return runner.create(code, preCode);
			},
		};
	},
};
