import { assembler, runner } from "../../../../utils/nes";

export default {
	prepare(level) {
		const code = level.content;

		return {
			compile() {
				let instructions, bytes, cpu;

				const compilation = assembler.compile(code);
				instructions = compilation.instructions;
				bytes = compilation.bytes;
				cpu = runner.create(bytes);

				while (true) {
					cpu.step();

					const lineNumber = instructions.find(
						(it) => runner.CODE_ADDRESS + it.address === cpu.pc.value
					)?.lineNumber;
					if (!lineNumber) break;
				}

				return { instructions, bytes, cpu };
			},
		};
	},
};
