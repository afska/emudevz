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
	expect(bytes.length).to.be.at.least(5);
	expect(bytes.slice(0, 5)).to.eql(
		new Uint8Array([0xa2, 0xc8, 0x8a, 0x69, 0x3c])
	);
})({
	locales: { es: "no modifica el código inicial" },
});

it("it only uses 4 instructions", () => {
	expect(instructions.length).to.equalN(4, "length");
})({
	locales: { es: "solo usa 4 instrucciones" },
});

it("it uses `SBC`", () => {
	const usesSbc = instructions.some((it) =>
		it.line.toLowerCase().startsWith("sbc")
	);
	expect(usesSbc).to.be.true;
})({
	locales: { es: "usa `SBC`" },
});

it("after execution, the Zero Flag is 1", () => {
	expect(cpu.flags.z).to.be.true;
})({
	locales: { es: "luego de la ejecución, la Bandera Zero es 1" },
});
