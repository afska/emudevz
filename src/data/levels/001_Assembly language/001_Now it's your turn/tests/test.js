const { code, asm6502 } = $;
const { assembler, runner } = asm6502;

let instructions, bytes, cpu;

beforeEach(() => {
	const compilation = assembler.compile(code);
	instructions = compilation.instructions;
	bytes = compilation.bytes;
	cpu = asm6502.runner.create(bytes);

	while (true) {
		cpu.step();

		const lineNumber = instructions.find(
			(it) => runner.CODE_ADDRESS + it.address === cpu.pc.value
		)?.lineNumber;
		if (!lineNumber) break;
	}
});

it("the address $4055 contains $7C", () => {
	cpu.memory.readAt(0x4055).should.equal(0x7c);
});

it("the address $4072 also contains $7C", () => {
	cpu.memory.readAt(0x4072).should.equal(0x7c);
});

it("the address $40B8 contains $18", () => {
	cpu.memory.readAt(0x40b8).should.equal(0x18);
});
