const { evaluate, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// [!] Duplicated >>>
const newHeader = (prgPages = 1, chrPages = 1) => {
	// prettier-ignore
	return [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, 0b00000000, 0b00000000, 0, 0, 0, 0, 0, 0, 0, 0];
};

const newRom = (prgBytes = []) => {
	const header = newHeader();
	const prg = prgBytes;
	const chr = [];
	for (let i = prgBytes.length; i < 16384; i++) prg.push(0);
	for (let i = 0; i < 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return bytes;
};

const newCPU = (prgBytes = null) => {
	const CPU = mainModule.default.CPU;
	const Cartridge = mainModule.default.Cartridge;

	const cartridge =
		prgBytes == null ? { prg: () => [] } : new Cartridge(newRom(prgBytes));

	return new CPU(cartridge);
};
// [!] Duplicated <<<

// 4.13 Instructions (3/6): Checks

it("`BIT`: argument == 'value'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("BIT");
	expect(instructions.BIT).to.be.an("object");
	instructions.BIT.argument.should.equal("value");
})({
	locales: {
		es: "`BIT`: argument == 'value'",
	},
	use: ({ id }, book) => id >= book.getId("4.13"),
});

[
	{ mask: 0b01100101, value: 0b10011010, z: true, n: true, v: false },
	{ mask: 0b11100101, value: 0b01011010, z: false, n: false, v: true },
].forEach(({ mask, value, z, n, v }) => {
	it(
		"`BIT`: updates the ~Z~, ~N~, and ~V~ flags with [A] = ~0b" +
			mask.toString(2).padStart(8, "0") +
			"~ and value = ~0b" +
			value.toString(2).padStart(8, "0") +
			"~",
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;

			cpu.a.setValue(mask);
			instructions.BIT.run(cpu, value);
			cpu.flags.z.should.equal(z);
			cpu.flags.n.should.equal(n);
			cpu.flags.v.should.equal(v);
		}
	)({
		locales: {
			es:
				"`BIT`: actualiza las banderas ~Z~, ~N~, and ~V~ con [A] = ~0b" +
				mask.toString(2).padStart(8, "0") +
				"~ and value = ~0b" +
				value.toString(2).padStart(8, "0") +
				"~",
		},
		use: ({ id }, book) => id >= book.getId("4.13"),
	});
});

[
	{
		instruction: "CMP",
		register: "a",
		source: 10,
		value: 120,
		z: false,
		n: true,
		c: false,
	},
	{
		instruction: "CMP",
		register: "a",
		source: 112,
		value: 2,
		z: false,
		n: false,
		c: true,
	},
	{
		instruction: "CPX",
		register: "x",
		source: 100,
		value: 100,
		z: true,
		n: false,
		c: true,
	},
	{
		instruction: "CPY",
		register: "y",
		source: 240,
		value: 30,
		z: false,
		n: true,
		c: true,
	},
].forEach(({ instruction, register, source, value, z, n, c }) => {
	it("`" + instruction + "`: argument == 'value'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("value");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'value'",
		},
		use: ({ id }, book) => id >= book.getId("4.13"),
	});

	it(
		"`" +
			instruction +
			"`: " +
			`compares and updates the proper flags with [${register.toUpperCase()}] = ${source} and value = ${value}`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;

			cpu[register].setValue(source);
			instructions[instruction].run(cpu, value);
			cpu.flags.z.should.equal(z);
			cpu.flags.n.should.equal(n);
			cpu.flags.c.should.equal(c);
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`compara y actualiza las banderas apropiadas con [${register.toUpperCase()}] = ${source} y value = ${value}`,
		},
		use: ({ id }, book) => id >= book.getId("4.13"),
	});
});
