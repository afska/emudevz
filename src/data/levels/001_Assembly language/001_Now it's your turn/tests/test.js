const { compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
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
