const { compile } = $;

it("when $4080 is 7, it writes $EE to $40BF", () => {
	const cpu = compile().cpu;
	cpu.memory.writeAt(0x4080, 7);
	cpu.run();
	cpu.memory.readAt(0x40bf).should.equalHex(0xee, "readAt(0x40bf)");
})({
	locales: { es: "cuando $4080 es 7, escribe $EE a $40BF" },
});

it("when $4080 is not 7, it writes $AA to $40BF", () => {
	const non7Bytes = [...Array(255).keys()].filter((it) => it !== 7);
	non7Bytes.forEach((byte) => {
		const cpu = compile().cpu;
		cpu.memory.writeAt(0x4080, byte);
		cpu.run();
		cpu.memory.readAt(0x40bf).should.equalHex(0xaa, "readAt(0x40bf)");
	});
})({
	locales: { es: "cuando $4080 no es 7, escribe $AA a $40BF" },
});
