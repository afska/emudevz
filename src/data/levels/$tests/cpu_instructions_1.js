const { EmulatorBuilder, testHelpers, evaluate, byte } = $;

let mainModule, NEEES;
beforeEach(async () => {
	mainModule = await evaluate();
	NEEES = await new EmulatorBuilder().addUserCPU(true, true).build();
});

const { newHeader, newRom } = testHelpers;
function newCPU(prgBytes = []) {
	const neees = new NEEES();
	neees.load(newRom(prgBytes));
	return neees.cpu;
}

// 5a.7 Instructions (1/5): Arithmetic

it("`/code/index.js` exports an object containing the `instructions` object", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("instructions");
	expect(mainModule.default.instructions).to.be.an("object");
})({
	locales: {
		es:
			"`/code/index.js` exporta un objeto que contiene el objeto `instructions`",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("every member of the `instructions` object has an `id`", () => {
	const instructions = mainModule.default.instructions;

	for (let key in instructions) {
		instructions[key].should.include.key("id");
		instructions[key].id.should.equal(key);
	}
})({
	locales: {
		es: "cada miembro del objeto `instructions` tiene un `id`",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ADC`: argument == 'value'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ADC");
	expect(instructions.ADC).to.be.an("object");
	instructions.ADC.argument.should.equalN("value", "argument");
})({
	locales: {
		es: "`ADC`: argument == 'value'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ADC`: adds the value to the Accumulator", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(20);
	instructions.ADC.run(cpu, 5);
	cpu.a.getValue().should.equalN(25, "getValue()");
})({
	locales: {
		es: "`ADC`: suma el valor al Acumulador",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ADC`: adds the Carry bit", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(20);
	cpu.flags.c = true;
	instructions.ADC.run(cpu, 5);
	cpu.a.getValue().should.equalN(26, "getValue()");
})({
	locales: {
		es: "`ADC`: suma el bit de Carry",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ADC`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(50);
	instructions.ADC.run(cpu, 120);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	instructions.ADC.run(cpu, 86);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`ADC`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ADC`: updates the Carry and Overflow flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(50);
	instructions.ADC.run(cpu, 10);
	cpu.flags.c.should.equalN(false, "c");
	cpu.flags.v.should.equalN(false, "v");

	// positive (60) + positive (75) = negative (-121) => overflow
	cpu.flags.c = false;
	instructions.ADC.run(cpu, 75);
	cpu.flags.c.should.equalN(false, "c");
	cpu.flags.v.should.equalN(true, "v");

	// result is over 255 => carry
	cpu.flags.c = false;
	instructions.ADC.run(cpu, 122);
	cpu.flags.c.should.equalN(true, "c");
	cpu.flags.v.should.equalN(false, "v");
})({
	locales: {
		es: "`ADC`: actualiza las banderas Carry y Overflow",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASL`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ASL");
	expect(instructions.ASL).to.be.an("object");
	instructions.ASL.argument.should.equalN("address", "argument");
})({
	locales: {
		es: "`ASL`: argument == 'address'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASL`: multiplies the value by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 12);
	instructions.ASL.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(24, "read(...)");
	cpu.flags.c.should.equalN(false, "c");
})({
	locales: {
		es: "`ASL`: multiplica el valor por 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASL`: fills the Carry Flag with bit 7", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000000);
	instructions.ASL.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalBin(0b10000000, "read(...)");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`ASL`: llena la Bandera Carry con el bit 7",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASL`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000000);
	instructions.ASL.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	cpu.memory.write(0x1234, 0);
	instructions.ASL.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`ASL`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASLa`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ASLa");
	expect(instructions.ASLa).to.be.an("object");
	instructions.ASLa.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`ASLa`: argument == 'no'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASLa`: multiplies [A] by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(12);
	instructions.ASLa.run(cpu);
	cpu.a.getValue().should.equalN(24, "getValue()");
	cpu.flags.c.should.equalN(false, "c");
})({
	locales: {
		es: "`ASLa`: multiplica [A] por 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASLa`: fills the Carry Flag with bit 7", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(0b11000000);
	instructions.ASLa.run(cpu);
	cpu.a.getValue().should.equalBin(0b10000000, "getValue()");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`ASLa`: llena la Bandera Carry con el bit 7",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ASLa`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(0b11000000);
	instructions.ASLa.run(cpu);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	cpu.a.setValue(0);
	instructions.ASLa.run(cpu);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`ASLa`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEC`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("DEC");
	expect(instructions.DEC).to.be.an("object");
	instructions.DEC.argument.should.equalN("address", "argument");
})({
	locales: {
		es: "`DEC`: argument == 'address'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEC`: decrements the value", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 9);
	instructions.DEC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(8, "read(...)");
})({
	locales: {
		es: "`DEC`: decrementa el valor",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEC`: updates the Zero Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 1);
	instructions.DEC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(0, "read(...)");
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`DEC`: actualiza la Bandera Zero",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEC`: updates the Negative Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0);
	instructions.DEC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(255, "read(...)");
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");
})({
	locales: {
		es: "`DEC`: actualiza la Bandera Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INC`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("INC");
	expect(instructions.INC).to.be.an("object");
	instructions.INC.argument.should.equalN("address", "argument");
})({
	locales: {
		es: "`INC`: argument == 'address'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INC`: increments the value in memory", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 8);
	instructions.INC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(9, "read(...)");
})({
	locales: {
		es: "`INC`: incrementa el valor en memoria",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INC`: sets the Zero Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 255);
	instructions.INC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(0, "read(...)");
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`INC`: actualiza la Bandera Zero",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INC`: sets the Negative Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 244);
	instructions.INC.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(245, "read(...)");
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");
})({
	locales: {
		es: "`INC`: actualiza la Bandera Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEX`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("DEX");
	expect(instructions.DEX).to.be.an("object");
	instructions.DEX.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`DEX`: argument == 'no'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEX`: decrements the [X] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.x.setValue(1);
	instructions.DEX.run(cpu);

	cpu.x.getValue().should.equalN(0, "getValue()");
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");

	cpu.x.setValue(0);
	instructions.DEX.run(cpu);

	cpu.x.getValue().should.equalN(255, "getValue()");
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");
})({
	locales: {
		es: "`DEX`: decrementa el registro [X] y actualiza las banderas",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEY`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("DEY");
	expect(instructions.DEY).to.be.an("object");
	instructions.DEY.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`DEY`: argument == 'no'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`DEY`: decrements the [Y] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.y.setValue(1);
	instructions.DEY.run(cpu);

	cpu.y.getValue().should.equalN(0, "getValue()");
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");

	cpu.y.setValue(0);
	instructions.DEY.run(cpu);

	cpu.y.getValue().should.equalN(255, "getValue()");
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");
})({
	locales: {
		es: "`DEY`: decrementa el registro [Y] y actualiza las banderas",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INX`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("INX");
	expect(instructions.INX).to.be.an("object");
	instructions.INX.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`INX`: argument == 'no'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INX`: increments the [X] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.x.setValue(255);
	instructions.INX.run(cpu);

	cpu.x.getValue().should.equalN(0, "getValue()");
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");

	cpu.x.setValue(244);
	instructions.INX.run(cpu);

	cpu.x.getValue().should.equalN(245, "getValue()");
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");
})({
	locales: {
		es: "`INX`: incrementa el registro [X] y actualiza las banderas",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INY`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("INY");
	expect(instructions.INY).to.be.an("object");
	instructions.INY.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`INY`: argument == 'no'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`INY`: increments the [Y] register and updates the flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.y.setValue(255);
	instructions.INY.run(cpu);

	cpu.y.getValue().should.equalN(0, "getValue()");
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");

	cpu.y.setValue(244);
	instructions.INY.run(cpu);

	cpu.y.getValue().should.equalN(245, "getValue()");
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");
})({
	locales: {
		es: "`INY`: incrementa el registro [Y] y actualiza las banderas",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSR`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("LSR");
	expect(instructions.LSR).to.be.an("object");
	instructions.LSR.argument.should.equalN("address", "argument");
})({
	locales: {
		es: "`LSR`: argument == 'address'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSR`: divides the value by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 128);
	instructions.LSR.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(64, "read(...)");
	cpu.flags.c.should.equalN(false, "c");
})({
	locales: {
		es: "`LSR`: divide el valor entre 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSR`: fills the Carry Flag with bit 0", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000001);
	instructions.LSR.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalBin(0b01100000, "read(...)");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`LSR`: llena la Bandera Carry con el bit 0",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSR`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000000);
	instructions.LSR.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(false, "n");

	cpu.memory.write(0x1234, 0);
	instructions.LSR.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`LSR`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSRa`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("LSRa");
	expect(instructions.LSRa).to.be.an("object");
	instructions.LSRa.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`LSR`: argument == 'no'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSRa`: divides [A] by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(128);
	instructions.LSRa.run(cpu);
	cpu.a.getValue().should.equalN(64, "getValue()");
	cpu.flags.c.should.equalN(false, "c");
})({
	locales: {
		es: "`LSRa`: divide [A] entre 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSRa`: fills the Carry Flag with bit 0", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(0b11000001);
	instructions.LSRa.run(cpu);
	cpu.a.getValue().should.equalBin(0b01100000, "getValue()");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`LSRa`: llena la Bandera Carry con el bit 0",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`LSRa`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(0b11000000);
	instructions.LSRa.run(cpu);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(false, "n");

	cpu.a.setValue(0);
	instructions.LSRa.run(cpu);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`LSRa`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROL`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ROL");
	expect(instructions.ROL).to.be.an("object");
	instructions.ROL.argument.should.equalN("address", "argument");
})({
	locales: {
		es: "`ROL`: argument == 'address'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROL`: multiplies the value by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 12);
	instructions.ROL.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(24, "read(...)");
})({
	locales: {
		es: "`ROL`: multiplica el valor por 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROL`: fills the Carry Flag with bit 7", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b10100000);
	instructions.ROL.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalBin(0b01000000, "read(...)");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`ROL`: llena la Bandera Carry con el bit 7",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROL`: sets the bit 0 with the Carry Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.flags.c = true;
	cpu.memory.write(0x1234, 0b10100000);
	instructions.ROL.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalBin(0b01000001, "read(...)");
})({
	locales: {
		es: "`ROL`: llena el bit 0 con la Bandera Carry",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROL`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b11000000);
	instructions.ROL.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	cpu.flags.c = false;

	cpu.memory.write(0x1234, 0);
	instructions.ROL.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`ROL`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROLa`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ROLa");
	expect(instructions.ROLa).to.be.an("object");
	instructions.ROLa.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`ROLa`: argument == 'no'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROLa`: multiplies [A] by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(12);
	instructions.ROLa.run(cpu);
	cpu.a.getValue().should.equalN(24, "getValue()");
})({
	locales: {
		es: "`ROLa`: multiplica [A] por 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROLa`: fills the Carry Flag with bit 7", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(0b10100000);
	instructions.ROLa.run(cpu);
	cpu.a.getValue().should.equalBin(0b01000000, "getValue()");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`ROLa`: llena la Bandera Carry con el bit 7",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROLa`: sets the bit 0 with the Carry Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.flags.c = true;
	cpu.a.setValue(0b10100000);
	instructions.ROLa.run(cpu);
	cpu.a.getValue().should.equalBin(0b01000001, "getValue()");
})({
	locales: {
		es: "`ROLa`: llena el bit 0 con la Bandera Carry",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROLa`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(0b11000000);
	instructions.ROLa.run(cpu);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	cpu.flags.c = false;

	cpu.a.setValue(0);
	instructions.ROLa.run(cpu);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`ROLa`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROR`: argument == 'address'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("ROR");
	expect(instructions.ROR).to.be.an("object");
	instructions.ROR.argument.should.equalN("address", "argument");
})({
	locales: {
		es: "`ROR`: argument == 'address'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROR`: divides the value by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 24);
	instructions.ROR.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalN(12, "read(...)");
})({
	locales: {
		es: "`ROR`: divide el valor entre 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROR`: fills the Carry Flag with bit 0", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.memory.write(0x1234, 0b00000101);
	instructions.ROR.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalBin(0b00000010, "read(...)");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`ROR`: llena la Bandera Carry con el bit 0",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROR`: sets the bit 7 with the Carry Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.flags.c = true;
	cpu.memory.write(0x1234, 0b00000101);
	instructions.ROR.run(cpu, 0x1234);
	cpu.memory.read(0x1234).should.equalBin(0b10000010, "read(...)");
})({
	locales: {
		es: "`ROR`: llena el bit 7 con la Bandera Carry",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`ROR`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.flags.c = true;
	cpu.memory.write(0x1234, 0b11000000);
	instructions.ROR.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	cpu.flags.c = false;

	cpu.memory.write(0x1234, 0);
	instructions.ROR.run(cpu, 0x1234);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`ROR`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`RORa`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("RORa");
	expect(instructions.RORa).to.be.an("object");
	instructions.RORa.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`RORa`: argument == 'address'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`RORa`: divides [A] by 2", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(24);
	instructions.RORa.run(cpu);
	cpu.a.getValue().should.equalN(12, "getValue()");
})({
	locales: {
		es: "`RORa`: divide [A] entre 2",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`RORa`: fills the Carry Flag with bit 0", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(0b00000101);
	instructions.RORa.run(cpu);
	cpu.a.getValue().should.equalBin(0b00000010, "getValue()");
	cpu.flags.c.should.equalN(true, "c");
})({
	locales: {
		es: "`RORa`: llena la Bandera Carry con el bit 0",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`RORa`: sets the bit 7 with the Carry Flag", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.flags.c = true;
	cpu.a.setValue(0b00000101);
	instructions.RORa.run(cpu);
	cpu.a.getValue().should.equalBin(0b10000010, "getValue()");
})({
	locales: {
		es: "`RORa`: llena el bit 7 con la Bandera Carry",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`RORa`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.flags.c = true;
	cpu.a.setValue(0b11000000);
	instructions.RORa.run(cpu);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	cpu.flags.c = false;

	cpu.a.setValue(0);
	instructions.RORa.run(cpu);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`RORa`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`SBC`: argument == 'value'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("SBC");
	expect(instructions.SBC).to.be.an("object");
	instructions.SBC.argument.should.equalN("value", "argument");
})({
	locales: {
		es: "`SBC`: argument == 'value'",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`SBC`: subtracts the value from the Accumulator - 1 when C is clear", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(20);
	instructions.SBC.run(cpu, 5);
	cpu.a.getValue().should.equalN(14, "getValue()");
})({
	locales: {
		es: "`SBC`: resta el valor del Acumulador - 1 cuando C está apagado",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`SBC`: subtracts the value from the Accumulator - 0 when C is set", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(20);
	cpu.flags.c = true;
	instructions.SBC.run(cpu, 5);
	cpu.a.getValue().should.equalN(15, "getValue()");
})({
	locales: {
		es: "`SBC`: resta el valor del Acumulador - 0 cuando C está encendido",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`SBC`: updates the Zero and Negative flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(20);
	instructions.SBC.run(cpu, 30);
	cpu.flags.z.should.equalN(false, "z");
	cpu.flags.n.should.equalN(true, "n");

	cpu.a.setValue(0);
	cpu.flags.c = true;
	instructions.SBC.run(cpu, 0);
	cpu.flags.z.should.equalN(true, "z");
	cpu.flags.n.should.equalN(false, "n");
})({
	locales: {
		es: "`SBC`: actualiza las banderas Zero y Negative",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});

it("`SBC`: updates the Carry and Overflow flags", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;

	cpu.a.setValue(50);
	instructions.SBC.run(cpu, 10);
	cpu.flags.c.should.equalN(true, "c");
	cpu.flags.v.should.equalN(false, "v");

	// positive (40) - negative (-100) = negative (-116) => overflow
	cpu.a.setValue(40);
	cpu.flags.c = true;
	instructions.SBC.run(cpu, byte.toU8(-100));
	cpu.flags.c.should.equalN(false, "c"); // borrow!
	cpu.flags.v.should.equalN(true, "v"); //  |
	//                                  v
	//                                  00101000 (40)
	//                                - 10011100 (-100)
	//                                  ^

	// negative (-40) - positive (100) = positive (116) => overflow
	cpu.a.setValue(byte.toU8(-40));
	cpu.flags.c = true;
	instructions.SBC.run(cpu, 100);
	cpu.flags.c.should.equalN(true, "c");
	cpu.flags.v.should.equalN(true, "v");
})({
	locales: {
		es: "`SBC`: actualiza las banderas Carry y Overflow",
	},
	use: (book) => book.isUnlockedHumanId("5a.7"),
});
