const { compile } = $;

let instructions, cpu;
beforeEach(() => {
	const compilation = compile();
	instructions = compilation.instructions;
	cpu = compilation.cpu;
	cpu.run();
});

it("the address $4086 contains $13", () => {
	cpu.memory.readAt(0x4086).should.equal(0x13);
});

it("it uses only 3 instructions", () => {
	instructions.length.should.equal(3);
});
