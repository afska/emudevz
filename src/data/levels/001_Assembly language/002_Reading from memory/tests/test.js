const { compile } = $;

const randomByte = () => Math.floor(Math.random() * 255);

let instructions, cpu, initialValue;
beforeEach(() => {
	const compilation = compile();
	instructions = compilation.instructions;
	cpu = compilation.cpu;

	initialValue = randomByte();
	cpu.memory.writeAt(0x4085, initialValue);
	cpu.run();
});

it("the address $4086 contains $4085 + 3", () => {
	cpu.memory.readAt(0x4086).should.equalHex(initialValue + 3, "readAt(0x4086)");
})({
	locales: { es: "la dirección $4086 contiene $4085 + 3" },
});

it("it only uses 3 instructions", () => {
	instructions.length.should.equalN(3, "length");
})({
	locales: { es: "solo utiliza 3 instrucciones" },
});
