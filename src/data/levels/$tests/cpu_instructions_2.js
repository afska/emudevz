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

// 4.12 Instructions (2/5): Data

[
	{ instruction: "CLC", flag: "c" },
	{ instruction: "CLD", flag: "d" },
	{ instruction: "CLI", flag: "i" },
	{ instruction: "CLV", flag: "v" },
].forEach(({ instruction, flag }) => {
	const name = flag.toUpperCase();

	it("`" + instruction + "`: argument == 'no'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("no");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'no'",
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});

	it("`" + instruction + "`: " + `clears the ~${name}~ flag`, () => {
		const cpu = newCPU();
		const instructions = mainModule.default.instructions;

		cpu.flags[flag] = true;
		instructions[instruction].run(cpu);
		cpu.flags[flag].should.equal(false);
	})({
		locales: {
			es: "`" + instruction + "`: " + `apaga la bandera ~${name}~`,
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});
});

[
	{ instruction: "LDA", register: "a" },
	{ instruction: "LDX", register: "x" },
	{ instruction: "LDY", register: "y" },
].forEach(({ instruction, register }) => {
	const name = register.toUpperCase();

	it("`" + instruction + "`: argument == 'value'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("value");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'value'",
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});

	it("`" + instruction + "`: " + `loads [${name}] (positive value)`, () => {
		const cpu = newCPU();
		const instructions = mainModule.default.instructions;

		instructions[instruction].run(cpu, 5);
		cpu[register].getValue().should.equal(5);
		cpu.flags.z.should.equal(false);
		cpu.flags.n.should.equal(false);
	})({
		locales: {
			es: "`" + instruction + "`: " + `carga [${name}] (valor positivo)`,
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});

	it("`" + instruction + "`: " + `loads [${name}] (negative value)`, () => {
		const cpu = newCPU();
		const instructions = mainModule.default.instructions;

		const value = byte.toU8(-5);
		instructions[instruction].run(cpu, value);
		cpu[register].getValue().should.equal(value);
		cpu.flags.z.should.equal(false);
		cpu.flags.n.should.equal(true);
	})({
		locales: {
			es: "`" + instruction + "`: " + `loads [${name}] (valor negativo)`,
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});

	it("`" + instruction + "`: " + `loads [${name}] (zero value)`, () => {
		const cpu = newCPU();
		const instructions = mainModule.default.instructions;

		instructions[instruction].run(cpu, 0);
		cpu[register].getValue().should.equal(0);
		cpu.flags.z.should.equal(true);
		cpu.flags.n.should.equal(false);
	})({
		locales: {
			es: "`" + instruction + "`: " + `carga [${name}] (valor cero)`,
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});
});

it("`PHA`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("PHA");
	expect(instructions.PHA).to.be.an("object");
	instructions.PHA.argument.should.equal("no");
})({
	locales: {
		es: "`PHA`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

it("`PHA`: pushes [A] onto the stack", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(88);
	instructions.PHA.run(cpu);
	cpu.stack.pop().should.equal(88);
})({
	locales: {
		es: "`PHA`: pone [A] en la pila",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

it("`PHP`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("PHP");
	expect(instructions.PHP).to.be.an("object");
	instructions.PHP.argument.should.equal("no");
})({
	locales: {
		es: "`PHP`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

it("`PHP`: pushes the flags onto the stack", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.flags.c = true;
	cpu.flags.z = false;
	cpu.flags.i = false;
	cpu.flags.d = false;
	cpu.flags.v = true;
	cpu.flags.n = false;
	instructions.PHP.run(cpu);
	cpu.stack.pop().should.equal(0b01110001);
})({
	locales: {
		es: "`PHP`: pone las banderas en la pila",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

it("`PLA`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("PLA");
	expect(instructions.PLA).to.be.an("object");
	instructions.PLA.argument.should.equal("no");
})({
	locales: {
		es: "`PLA`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

it("`PLA`: sets [A] with a value from the stack", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.stack.push(76);
	instructions.PLA.run(cpu);
	cpu.a.getValue().should.equal(76);
})({
	locales: {
		es: "`PLA`: asigna [A] con un valor de la pila",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

it("`PLP`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("PLP");
	expect(instructions.PLP).to.be.an("object");
	instructions.PLP.argument.should.equal("no");
})({
	locales: {
		es: "`PLP`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

it("`PLP`: sets the flags with a value from the stack", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.stack.push(0b01000101);
	instructions.PLP.run(cpu);
	cpu.flags.should.include({
		n: false,
		v: true,
		d: false,
		i: true,
		z: false,
		c: true,
	});
})({
	locales: {
		es: "`PLP`: asigna las banderas con un valor de la pila",
	},
	use: ({ id }, book) => id >= book.getId("4.12"),
});

[
	{ instruction: "SEC", flag: "c" },
	{ instruction: "SED", flag: "d" },
	{ instruction: "SEI", flag: "i" },
].forEach(({ instruction, flag }) => {
	const name = flag.toUpperCase();

	it("`" + instruction + "`: argument == 'no'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("no");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'no'",
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});

	it("`" + instruction + "`: " + `sets the ~${name}~ flag`, () => {
		const cpu = newCPU();
		const instructions = mainModule.default.instructions;

		cpu.flags[flag] = false;
		instructions[instruction].run(cpu);
		cpu.flags[flag].should.equal(true);
	})({
		locales: {
			es: "`" + instruction + "`: " + `enciende la bandera ~${name}~`,
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});
});

[
	{ instruction: "STA", register: "a" },
	{ instruction: "STX", register: "x" },
	{ instruction: "STY", register: "y" },
].forEach(({ instruction, register }) => {
	const name = register.toUpperCase();

	it("`" + instruction + "`: argument == 'address'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("address");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'address'",
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});

	it(
		"`" + instruction + "`: " + `writes [${name}] to the memory address`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;

			cpu[register].setValue(123);
			instructions[instruction].run(cpu, 0x1349);
			cpu.memory.read(0x1349).should.equal(123);
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`escribe [${name}] en la dirección de memoria`,
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});
});

[
	{
		instruction: "TAX",
		sourceRegister: "a",
		targetRegister: "x",
	},
	{
		instruction: "TAY",
		sourceRegister: "a",
		targetRegister: "y",
	},
	{
		instruction: "TSX",
		sourceRegister: "sp",
		targetRegister: "x",
	},
	{
		instruction: "TXA",
		sourceRegister: "x",
		targetRegister: "a",
	},
	{
		instruction: "TXS",
		sourceRegister: "x",
		targetRegister: "sp",
	},
	{
		instruction: "TYA",
		sourceRegister: "y",
		targetRegister: "a",
	},
].forEach(({ instruction, sourceRegister, targetRegister }) => {
	const sourceName = sourceRegister.toUpperCase();
	const targetName = targetRegister.toUpperCase();

	it("`" + instruction + "`: argument == 'no'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("no");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'no'",
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});

	it(
		"`" +
			instruction +
			"`: " +
			`transfers the value from [${sourceName}] to [${targetName}]`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;

			cpu[sourceRegister].setValue(123);
			instructions[instruction].run(cpu);
			cpu[targetRegister].getValue().should.equal(123);
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`transfiere el valor de [${sourceName}] a [${targetName}]`,
		},
		use: ({ id }, book) => id >= book.getId("4.12"),
	});
});
