const { EmulatorBuilder, testHelpers, evaluate, byte } = $;

let mainModule, NEEES;
before(async () => {
	mainModule = await evaluate();
	NEEES = await new EmulatorBuilder().addUserCPU(true, true).build();
});

const { newHeader, newRom } = testHelpers;
function newCPU(prgBytes = []) {
	const neees = new NEEES();
	neees.load(newRom(prgBytes));
	return neees.cpu;
}

// 5a.9 Instructions (3/5): Checks

it("`BIT`: argument == 'value'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("BIT");
	expect(instructions.BIT).to.be.an("object");
	instructions.BIT.argument.should.equalN("value", "argument");
})({
	locales: {
		es: "`BIT`: argument == 'value'",
	},
	use: ({ id }, book) => id >= book.getId("5a.9"),
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
			cpu.flags.z.should.equalN(z, "z");
			cpu.flags.n.should.equalN(n, "n");
			cpu.flags.v.should.equalN(v, "v");
		}
	)({
		locales: {
			es:
				"`BIT`: actualiza las banderas ~Z~, ~N~, y ~V~ con [A] = ~0b" +
				mask.toString(2).padStart(8, "0") +
				"~ y value = ~0b" +
				value.toString(2).padStart(8, "0") +
				"~",
		},
		use: ({ id }, book) => id >= book.getId("5a.9"),
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
	const name = register.toUpperCase();

	it("`" + instruction + "`: argument == 'value'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equalN("value", "argument");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'value'",
		},
		use: ({ id }, book) => id >= book.getId("5a.9"),
	});

	it(
		"`" +
			instruction +
			"`: " +
			`compares and updates the proper flags with [${name}] = ${source} and value = ${value}`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;

			cpu[register].setValue(source);
			instructions[instruction].run(cpu, value);
			cpu.flags.z.should.equalN(z, "z");
			cpu.flags.n.should.equalN(n, "n");
			cpu.flags.c.should.equalN(c, "c");
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`compara y actualiza las banderas apropiadas con [${name}] = ${source} y value = ${value}`,
		},
		use: ({ id }, book) => id >= book.getId("5a.9"),
	});
});

["AND", "EOR", "ORA"].forEach((instruction) => {
	it("`" + instruction + "`: argument == 'value'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equalN("value", "argument");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'value'",
		},
		use: ({ id }, book) => id >= book.getId("5a.9"),
	});
});

[
	{
		instruction: "AND",
		value1: 0b10100100,
		value2: 0b10000100,
		result: 0b10000100,
		zero: false,
		negative: true,
		symbol: "&",
	},
	{
		instruction: "EOR",
		value1: 0b00100100,
		value2: 0b00010100,
		result: 0b00110000,
		zero: false,
		negative: false,
		symbol: "^",
	},
	{
		instruction: "EOR",
		value1: 0b11111111,
		value2: 0b11111111,
		result: 0b00000000,
		zero: true,
		negative: false,
		symbol: "^",
	},
	{
		instruction: "ORA",
		value1: 0b00100100,
		value2: 0b00010100,
		result: 0b00110100,
		zero: false,
		negative: false,
		symbol: "|",
	},
].forEach(({ instruction, value1, value2, result, zero, negative, symbol }) => {
	it(
		"`" +
			instruction +
			"`: " +
			`works with ${value1
				.toString(2)
				.padStart(8, "0")} ${symbol} ${value2
				.toString(2)
				.padStart(8, "0")} => ${result.toString(2).padStart(8, "0")}`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;

			cpu.a.setValue(value1);
			instructions[instruction].run(cpu, value2);
			cpu.a.getValue().should.equalN(result, "getValue()");
			cpu.flags.z.should.equalN(zero, "z");
			cpu.flags.n.should.equalN(negative, "n");
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`funciona con ${value1
					.toString(2)
					.padStart(8, "0")} ${symbol} ${value2
					.toString(2)
					.padStart(8, "0")} => ${result.toString(2).padStart(8, "0")}`,
		},
		use: ({ id }, book) => id >= book.getId("5a.9"),
	});
});
