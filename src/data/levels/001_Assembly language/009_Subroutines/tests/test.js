const { compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
});

it("TODO", () => {
	// const lsb = cpu.memory.readAt(0x01fe);
	// const msb = cpu.memory.readAt(0x01ff);
	// const address = (msb << 8) | lsb;
	// cpu.sp.value.should.equal(0xff);
	// cpu.pc.value.should.equal(address);
});
