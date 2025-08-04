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

	expect(cpu.sp.value).to.equalHex(0xff, "sp");
	expect(cpu.pc.value).to.equalHex(address, "pc");
})({
	locales: { es: "salta a la dirección correcta" },
});
