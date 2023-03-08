const { evaluate, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

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

// 4.11 Instructions (1/6): Arithmetic

it("`/code/index.js` exports an object containing the `instructions` object", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("instructions");
	expect(mainModule.default.instructions).to.be.an("object");
})({
	locales: {
		es:
			"`/code/index.js` exporta un objeto que contiene el objeto `instructions`",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ADC`: argument == 'value'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ADC");
	expect(instructions.ADC).to.be.an("object");
	instructions.ADC.argument.should.equal("value");
})({
	locales: {
		es: "`ADC`: argument == 'value'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ADC`: adds the value to the Accumulator", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(20);
	instructions.ADC.run(cpu, 5);
	cpu.a.getValue().should.equal(25);
})({
	locales: {
		es: "`ADC`: suma el valor al Acumulador",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ADC`: adds the Carry bit", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(20);
	cpu.flags.c = true;
	instructions.ADC.run(cpu, 5);
	cpu.a.getValue().should.equal(26);
})({
	locales: {
		es: "`ADC`: suma el bit de Carry",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ADC`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(50);
	instructions.ADC.run(cpu, 120);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);

	instructions.ADC.run(cpu, 86);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);
})({
	locales: {
		es: "`ADC`: actualiza las banderas Zero y Negative",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ADC`: updates the Carry and Overflow flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(50);
	instructions.ADC.run(cpu, 10);
	cpu.flags.c.should.equal(false);
	cpu.flags.v.should.equal(false);

	// positive (60) + positive (75) = negative (-121) => overflow
	cpu.flags.c = false;
	instructions.ADC.run(cpu, 75);
	cpu.flags.c.should.equal(false);
	cpu.flags.v.should.equal(true);

	// result is over 255 => carry
	cpu.flags.c = false;
	instructions.ADC.run(cpu, 122);
	cpu.flags.c.should.equal(true);
	cpu.flags.v.should.equal(false);
})({
	locales: {
		es: "`ADC`: actualiza las banderas Carry y Overflow",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ASL`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ASL");
	expect(instructions.ASL).to.be.an("object");
	instructions.ASL.argument.should.equal("address");
})({
	locales: {
		es: "`ASL`: argument == 'address'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ASL`: multiplies the value by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 12);
	instructions.ASL.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(24);
	cpu.flags.c.should.equal(false);
})({
	locales: {
		es: "`ASL`: multiplica el valor por dos",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ASL`: fills the Carry Flag with bit 7", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000000);
	instructions.ASL.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(0b10000000);
	cpu.flags.c.should.equal(true);
})({
	locales: {
		es: "`ASL`: llena la Bandera Carry con el bit 7",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`ASL`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000000);
	instructions.ASL.run(cpu, 0x1234);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);

	cpu.memory.write(0x1234, 0);
	instructions.ASL.run(cpu, 0x1234);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);
})({
	locales: {
		es: "`ASL`: actualiza las banderas Zero y Negative",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEC`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("DEC");
	expect(instructions.DEC).to.be.an("object");
	instructions.DEC.argument.should.equal("address");
})({
	locales: {
		es: "`DEC`: argument == 'address'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEC`: decrements the value", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 9);
	instructions.DEC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(8);
})({
	locales: {
		es: "`DEC`: decrementa el valor",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEC`: updates the Zero Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 1);
	instructions.DEC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(0);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);
})({
	locales: {
		es: "`DEC`: actualiza la Bandera Zero",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEC`: updates the Negative Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0);
	instructions.DEC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(255);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);
})({
	locales: {
		es: "`DEC`: actualiza la Bandera Negative",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INC`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("INC");
	expect(instructions.INC).to.be.an("object");
	instructions.INC.argument.should.equal("address");
})({
	locales: {
		es: "`INC`: argument == 'address'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INC`: increments the value in memory", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 8);
	instructions.INC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(9);
})({
	locales: {
		es: "`INC`: incrementa el valor en memoria",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INC`: sets the Zero Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 255);
	instructions.INC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(0);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);
})({
	locales: {
		es: "`INC`: actualiza la Bandera Zero",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INC`: sets the Negative Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 244);
	instructions.INC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(245);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);
})({
	locales: {
		es: "`INC`: actualiza la Bandera Negative",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEX`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("DEX");
	expect(instructions.DEX).to.be.an("object");
	instructions.DEX.argument.should.equal("no");
})({
	locales: {
		es: "`DEX`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEX`: decrements the [X] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.x.setValue(1);
	instructions.DEX.run(cpu);

	cpu.x.getValue().should.equal(0);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);

	cpu.x.setValue(0);
	instructions.DEX.run(cpu);

	cpu.x.getValue().should.equal(255);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);
})({
	locales: {
		es: "`DEX`: decrementa el registro [X] y actualiza las banderas",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEY`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("DEY");
	expect(instructions.DEY).to.be.an("object");
	instructions.DEY.argument.should.equal("no");
})({
	locales: {
		es: "`DEY`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`DEY`: decrements the [Y] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.y.setValue(1);
	instructions.DEY.run(cpu);

	cpu.y.getValue().should.equal(0);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);

	cpu.y.setValue(0);
	instructions.DEY.run(cpu);

	cpu.y.getValue().should.equal(255);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);
})({
	locales: {
		es: "`DEY`: decrementa el registro [Y] y actualiza las banderas",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INX`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("INX");
	expect(instructions.INX).to.be.an("object");
	instructions.INX.argument.should.equal("no");
})({
	locales: {
		es: "`INX`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INX`: increments the [X] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.x.setValue(255);
	instructions.INX.run(cpu);

	cpu.x.getValue().should.equal(0);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);

	cpu.x.setValue(244);
	instructions.INX.run(cpu);

	cpu.x.getValue().should.equal(245);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);
})({
	locales: {
		es: "`INX`: incrementa el registro [X] y actualiza las banderas",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INY`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("INY");
	expect(instructions.INY).to.be.an("object");
	instructions.INY.argument.should.equal("no");
})({
	locales: {
		es: "`INY`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`INY`: increments the [Y] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.y.setValue(255);
	instructions.INY.run(cpu);

	cpu.y.getValue().should.equal(0);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);

	cpu.y.setValue(244);
	instructions.INY.run(cpu);

	cpu.y.getValue().should.equal(245);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(true);
})({
	locales: {
		es: "`INY`: incrementa el registro [Y] y actualiza las banderas",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`LSR`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("LSR");
	expect(instructions.LSR).to.be.an("object");
	instructions.LSR.argument.should.equal("address");
})({
	locales: {
		es: "`LSR`: argument == 'address'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`LSR`: divides the value by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 128);
	instructions.LSR.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(64);
	cpu.flags.c.should.equal(false);
})({
	locales: {
		es: "`LSR`: divide el valor entre dos",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`LSR`: fills the Carry Flag with bit 0", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000001);
	instructions.LSR.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equal(0b01100000);
	cpu.flags.c.should.equal(true);
})({
	locales: {
		es: "`LSR`: llena la Bandera Carry con el bit 0",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("`LSR`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000000);
	instructions.LSR.run(cpu, 0x1234);
	cpu.flags.z.should.equal(false);
	cpu.flags.n.should.equal(false);

	cpu.memory.write(0x1234, 0);
	instructions.LSR.run(cpu, 0x1234);
	cpu.flags.z.should.equal(true);
	cpu.flags.n.should.equal(false);
})({
	locales: {
		es: "`LSR`: actualiza las banderas Zero y Negative",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});
