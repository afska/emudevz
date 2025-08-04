const { compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
});

it("$407F contains $00", () => {
	expect(cpu.memory.readAt(0x407f)).to.equalHex(0x00, "readAt(0x407f)");
})({
	locales: { es: "$407F contiene $00" },
});

it("all bytes from $4080 to $40BF contain $AA", () => {
	const addresses = [...Array(64).keys()].map((it) => 0x4080 + it);
	addresses.forEach((address) => {
		const name = `readAt(0x${address.toString(16).padStart(4, "0")})`;
		expect(cpu.memory.readAt(address)).to.equalHex(0xaa, name);
	});
})({
	locales: { es: "todos los bytes desde $4080 hasta $40BF contienen $AA" },
});

it("$40C0 contains $00", () => {
	expect(cpu.memory.readAt(0x40c0)).to.equalHex(0x00, "readAt(0x40c0)");
})({
	locales: { es: "$40C0 contiene $00" },
});
