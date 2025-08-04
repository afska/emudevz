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

// 5a.11 Instructions (5/5): System (interrupts)

it("the CPU can handle <RESET> interrupts", () => {
	const cpu = newCPU();
	cpu.cycle = 8;
	cpu.pc.setValue(0x1234);
	cpu.flags.setValue(0);

	const interrupt = {
		id: "RESET",
		vector: 0xfffc,
	};
	const memoryRead = cpu.memory.read.bind(cpu.memory);
	cpu.memory.read = (address) => {
		if (address === interrupt.vector) return 0x25;
		else if (address === interrupt.vector + 1) return 0x31;
		else return memoryRead(address);
	};

	cpu.interrupt(interrupt);

	expect(cpu.stack.pop()).to.equalBin(0b00100000, "pop()");
	expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
	expect(cpu.cycle).to.equalN(15, "cycle");
	expect(cpu.flags.i).to.equalN(true, "i");
	expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
})({
	locales: {
		es: "la CPU puede manejar interrupciones <RESET>",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("the CPU can handle NMI interrupts", () => {
	const cpu = newCPU();
	cpu.cycle = 8;
	cpu.pc.setValue(0x1234);
	cpu.flags.setValue(0);

	const interrupt = {
		id: "NMI",
		vector: 0xfffa,
	};
	const memoryRead = cpu.memory.read.bind(cpu.memory);
	cpu.memory.read = (address) => {
		if (address === 0xfffa) return 0x25;
		else if (address === 0xfffb) return 0x31;
		else return memoryRead(address);
	};

	cpu.flags.i = true;
	cpu.interrupt(interrupt);

	expect(cpu.stack.pop()).to.equalBin(0b00100100, "pop()");
	expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
	expect(cpu.cycle).to.equalN(15, "cycle");
	expect(cpu.flags.i).to.equalN(true, "i");
	expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
})({
	locales: {
		es: "la CPU puede manejar interrupciones NMI",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("the CPU can handle <IRQ> interrupts", () => {
	const cpu = newCPU();
	cpu.cycle = 8;
	cpu.pc.setValue(0x1234);
	cpu.flags.setValue(0);

	const interrupt = {
		id: "IRQ",
		vector: 0xfffe,
	};
	const memoryRead = cpu.memory.read.bind(cpu.memory);
	cpu.memory.read = (address) => {
		if (address === 0xfffe) return 0x25;
		else if (address === 0xffff) return 0x31;
		else return memoryRead(address);
	};

	cpu.interrupt(interrupt);

	expect(cpu.stack.pop()).to.equalBin(0b00100000, "pop()");
	expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
	expect(cpu.cycle).to.equalN(15, "cycle");
	expect(cpu.flags.i).to.equalN(true, "i");
	expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
})({
	locales: {
		es: "la CPU puede manejar interrupciones <IRQ>",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("the CPU ignores <IRQ> interrupts if the ~I~ flag is set", () => {
	const cpu = newCPU();
	cpu.cycle = 8;
	cpu.pc.setValue(0x1234);
	cpu.flags.setValue(0);
	const sp = cpu.sp.getValue();

	const interrupt = {
		id: "IRQ",
		vector: 0xfffe,
	};
	const memoryRead = cpu.memory.read.bind(cpu.memory);
	cpu.memory.read = (address) => {
		if (address === 0xfffe) return 0x25;
		else if (address === 0xffff) return 0x31;
		else return memoryRead(address);
	};

	cpu.flags.i = true;
	cpu.interrupt(interrupt);

	expect(cpu.sp.getValue()).to.equalHex(sp, "getValue()");
	expect(cpu.flags.i).to.equalN(true, "i");
	expect(cpu.pc.getValue()).to.equalHex(0x1234, "getValue()");
	expect(cpu.cycle).to.equalN(8, "cycle");
})({
	locales: {
		es: "la CPU ignora interrupciones <IRQ> si la bandera ~I~ está encendida",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("`BRK`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	expect(instructions).to.include.key("BRK");
	expect(instructions.BRK).to.be.an("object");
	expect(instructions.BRK.argument).to.equalN("no", "argument");
})({
	locales: {
		es: "`BRK`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("`BRK`: produces an <IRQ> interrupt (bit 4 from flags should be on)", () => {
	const cpu = newCPU();
	const instructions = mainModule.default.instructions;
	cpu.cycle = 8;
	cpu.pc.setValue(0x1234);
	cpu.flags.setValue(0);

	const memoryRead = cpu.memory.read.bind(cpu.memory);
	cpu.memory.read = (address) => {
		if (address === 0xfffe) return 0x25;
		else if (address === 0xffff) return 0x31;
		else return memoryRead(address);
	};

	instructions.BRK.run(cpu);

	expect(cpu.stack.pop()).to.equalBin(0b00110000, "pop()");
	expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
	expect(cpu.cycle).to.equalN(15, "cycle");
	expect(cpu.flags.i).to.equalN(true, "i");
	expect(cpu.pc.getValue()).to.equalHex(0x3125, "getValue()");
})({
	locales: {
		es:
			"`BRK`: produce una interrupción <IRQ> (el bit 4 de las banderas debería estar encendido)",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("`NOP`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	expect(instructions).to.include.key("NOP");
	expect(instructions.NOP).to.be.an("object");
	expect(instructions.NOP.argument).to.equalN("no", "argument");
})({
	locales: {
		es: "`NOP`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});

it("`NOP`: implements `run(...)` as an empty function", () => {
	const instructions = mainModule.default.instructions;
	expect(instructions.NOP).to.respondTo("run");
	expect(instructions.NOP.run.toString().replace(/\s/g, "")).to.equalN(
		"run(){}",
		"run"
	);
})({
	locales: {
		es: "`NOP`: implementa `run(...)` como una función vacía",
	},
	use: ({ id }, book) => id >= book.getId("5a.11"),
});
