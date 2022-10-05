const { compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
});

it("$407F contains $00", () => {
	cpu.memory.readAt(0x407f).should.equal(0x00);
});

it("all bytes from $4080 to $40BF contain $AA", () => {
	const addresses = [...Array(64).keys()].map((it) => 0x4080 + it);
	addresses.forEach((address) => {
		cpu.memory.readAt(address).should.equal(0xaa);
	});
});

it("$40C0 contains $00", () => {
	cpu.memory.readAt(0x40c0).should.equal(0x00);
});
