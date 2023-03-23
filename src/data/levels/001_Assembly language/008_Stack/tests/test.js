const { compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
});

it("it jumps to the right address", () => {
	const lsb = cpu.memory.readAt(0x01fe);
	const msb = cpu.memory.readAt(0x01ff);
	const address = (msb << 8) | lsb;

	cpu.sp.value.should.equalHex(0xff, "sp");
	cpu.pc.value.should.equalHex(address, "pc");
})({
	locales: { es: "salta a la dirección correcta" },
});
