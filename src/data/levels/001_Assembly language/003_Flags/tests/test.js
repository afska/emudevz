const { compile } = $;

let instructions, bytes, cpu;
beforeEach(() => {
	const compilation = compile();
	instructions = compilation.instructions;
	bytes = compilation.bytes;
	cpu = compilation.cpu;
	cpu.run();
});

it("it doesn't change the initial code", () => {
	bytes.length.should.be.at.least(5);
	bytes.slice(0, 5).should.eql(new Uint8Array([0xa2, 0xc8, 0x8a, 0x69, 0x3c]));
});

it("it only uses 4 instructions", () => {
	instructions.length.should.equal(4);
});

it("it uses SBC", () => {
	const usesSbc = instructions.some((it) =>
		it.line.toLowerCase().startsWith("sbc")
	);
	usesSbc.should.be.true;
});

it("after execution, the Zero Flag is 1", () => {
	cpu.flags.z.should.be.true;
});
