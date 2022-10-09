const { code, compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
});

it("doesn't load anything from the zero page", () => {
	if (/^LD[AXY] \$\d\d/m.test(code)) {
		throw new Error(
			"You code is probably doing something wrong.\nRemember: if you want to load a $99, it's `LDA #$99` instead of `LDA $99`"
		);
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
