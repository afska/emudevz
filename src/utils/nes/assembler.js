import tools6502 from "@neshacker/6502-tools";

const { assemble } = require("@neshacker/6502-tools/src/assembler/assemble");
const {
	Instruction,
} = require("@neshacker/6502-tools/src/assembler/Instruction");
const { parse } = require("@neshacker/6502-tools/src/parser");

export default {
	compile(asm) {
		return new Uint8Array(
			tools6502.Assembler.toHexString(asm)
				.match(/.{1,2}/g)
				.map((it) => parseInt(it, 16))
		);
	},

	inspect(asm) {
		const root = parse(asm);
		const instructions = [];

		assemble(root).forEach((lir) => {
			const address = lir.address;

			if (lir instanceof Instruction) {
				console.log(lir);
				instructions.push({
					address,
					line: lir.source,
				});
			}
		});

		return instructions;
	},
};
