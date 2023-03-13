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

// 4.14 Instructions (4/5): Branching

[
	{ instruction: "BCC", flag: "c" },
	{ instruction: "BNE", flag: "z" },
	{ instruction: "BPL", flag: "n" },
	{ instruction: "BVC", flag: "v" },
].forEach(({ instruction, flag }) => {
	it("`" + instruction + "`: argument == 'address'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("address");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'address'",
		},
		use: ({ id }, book) => id >= book.getId("4.14"),
	});

	it(
		"`" +
			instruction +
			"`: " +
			`jumps if the ~${flag.toUpperCase()}~ flag is clear`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;
			cpu.pc.setValue(0x1000);

			cpu.flags[flag] = false;
			instructions[instruction].run(cpu, 0x2000);
			cpu.pc.getValue().should.equal(0x2000);
			cpu.extraCycles.should.equal(1);
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`salta si la bandera ~${flag.toUpperCase()}~ está apagada`,
		},
		use: ({ id }, book) => id >= book.getId("4.14"),
	});

	it(
		"`" +
			instruction +
			"`: " +
			`doesn't jump if the ~${flag.toUpperCase()}~ flag is set`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;
			cpu.pc.setValue(0x1000);

			cpu.extraCycles = 3;
			cpu.flags[flag] = true;
			instructions[instruction].run(cpu, 0x2000);
			cpu.pc.getValue().should.equal(0x1000);
			cpu.extraCycles.should.equal(3);
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`no salta si la bandera ~${flag.toUpperCase()}~ está encendida`,
		},
		use: ({ id }, book) => id >= book.getId("4.14"),
	});
});

[
	{ instruction: "BCS", flag: "c" },
	{ instruction: "BEQ", flag: "z" },
	{ instruction: "BMI", flag: "n" },
	{ instruction: "BVS", flag: "v" },
].forEach(({ instruction, flag }) => {
	it("`" + instruction + "`: argument == 'address'", () => {
		const instructions = mainModule.default.instructions;
		instructions.should.include.key(instruction);
		expect(instructions[instruction]).to.be.an("object");
		instructions[instruction].argument.should.equal("address");
	})({
		locales: {
			es: "`" + instruction + "`: argument == 'address'",
		},
		use: ({ id }, book) => id >= book.getId("4.14"),
	});

	it(
		"`" +
			instruction +
			"`: " +
			`jumps if the ~${flag.toUpperCase()}~ flag is set`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;
			cpu.pc.setValue(0x1000);

			cpu.flags[flag] = true;
			instructions[instruction].run(cpu, 0x2000);
			cpu.pc.getValue().should.equal(0x2000);
			cpu.extraCycles.should.equal(1);
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`salta si la bandera ~${flag.toUpperCase()}~ está encendida`,
		},
		use: ({ id }, book) => id >= book.getId("4.14"),
	});

	it(
		"`" +
			instruction +
			"`: " +
			`doesn't jump if the ~${flag.toUpperCase()}~ flag is clear`,
		() => {
			const cpu = newCPU();
			const instructions = mainModule.default.instructions;
			cpu.pc.setValue(0x1000);

			cpu.extraCycles = 3;
			cpu.flags[flag] = false;
			instructions[instruction].run(cpu, 0x2000);
			cpu.pc.getValue().should.equal(0x1000);
			cpu.extraCycles.should.equal(3);
		}
	)({
		locales: {
			es:
				"`" +
				instruction +
				"`: " +
				`no salta si la bandera ~${flag.toUpperCase()}~ está encendida`,
		},
		use: ({ id }, book) => id >= book.getId("4.14"),
	});
});

it("`JMP`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("JMP");
	expect(instructions.JMP).to.be.an("object");
	instructions.JMP.argument.should.equal("address");
})({
	locales: {
		es: "`JMP`: argument == 'address'",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});

it("`JMP`: jumps to the address", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;
	cpu.pc.setValue(0x1000);

	instructions.JMP.run(cpu, 0x1234);
	cpu.pc.getValue().should.equal(0x1234);
})({
	locales: {
		es: "`JMP`: salta a la dirección",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});

it("`JSR`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("JSR");
	expect(instructions.JSR).to.be.an("object");
	instructions.JSR.argument.should.equal("address");
})({
	locales: {
		es: "`JSR`: argument == 'address'",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});

it("`JSR`: pushes [PC] - 1 to the stack and jumps to the address", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;
	cpu.pc.setValue(0xfe31);

	instructions.JSR.run(cpu, 0x1234);
	cpu.stack.pop16().should.equal(0xfe30);
	cpu.pc.getValue().should.equal(0x1234);
})({
	locales: {
		es: "`JSR`: pone [PC] - 1 en la pila y salta a la dirección",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});

it("`RTI`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("RTI");
	expect(instructions.RTI).to.be.an("object");
	instructions.RTI.argument.should.equal("no");
})({
	locales: {
		es: "`RTI`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});

it("`RTI`: updates the flags and [PC] from the stack", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;
	cpu.pc.setValue(0x1000);

	cpu.stack.push16(0xfe35);
	cpu.stack.push(0b10101000);
	instructions.RTI.run(cpu);
	cpu.flags.getValue().should.equal(0b10101000);
	cpu.pc.getValue().should.equal(0xfe35);
})({
	locales: {
		es: "`RTI`: actualiza las banderas y [PC] desde la pila",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});

it("`RTS`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("RTS");
	expect(instructions.RTS).to.be.an("object");
	instructions.RTS.argument.should.equal("no");
})({
	locales: {
		es: "`RTS`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});

it("`RTS`: updates [PC] from a value in the stack + 1", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;
	cpu.pc.setValue(0x1000);

	cpu.stack.push16(0xfe35);
	instructions.RTS.run(cpu);
	cpu.pc.getValue().should.equal(0xfe36);
})({
	locales: {
		es: "`RTS`: actualiza [PC] desde un valor en la pila + 1",
	},
	use: ({ id }, book) => id >= book.getId("4.14"),
});
