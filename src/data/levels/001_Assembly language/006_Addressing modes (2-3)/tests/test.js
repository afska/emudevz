const { compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
});

it("$407F contains $00", () => {
	cpu.memory.readAt(0x407f).should.equal(0x00);
})({
	locales: { es: "$407F contiene $00" },
});

it("all bytes from $4080 to $40BF contain $AA", () => {
	const addresses = [...Array(64).keys()].map((it) => 0x4080 + it);
	addresses.forEach((address) => {
		cpu.memory.readAt(address).should.equal(0xaa);
	});
})({
	locales: { es: "todos los bytes desde $4080 hasta $40BF contienen $AA" },
});

it("$40C0 contains $00", () => {
	cpu.memory.readAt(0x40c0).should.equal(0x00);
})({
	locales: { es: "$40C0 contiene $00" },
});
