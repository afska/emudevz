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

// 5a.1 New CPU

it("`/code/index.js` exports an object containing the `CPU` class", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("CPU");
	expect(mainModule.default.CPU).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase `CPU`",
	},
	use: ({ id }, book) => id >= book.getId("5a.1"),
});

// 5a.2 Registers

it("includes a `memory` property with the received `cpuMemory`", async () => {
	mainModule = await evaluate();
	const CPU = mainModule.default.CPU;
	const CPUMemory = mainModule.default.CPUMemory;
	const cpuMemory = new CPUMemory();

	const cpu = new CPU(cpuMemory);
	cpu.should.include.key("memory");
	cpu.memory.should.equal(cpuMemory);
})({
	locales: {
		es: "incluye una propiedad `memory` con la `cpuMemory` recibida",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("includes two mysterious properties: `cycle` and `extraCycles`", () => {
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

	["cycle", "extraCycles"].forEach((property) => {
		cpu.should.include.key(property);
		cpu[property].should.equalN(0, property);
	});
})({
	locales: {
		es: "incluye dos propiedades misteriosas: `cycle` y `extraCycles`",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("includes all the registers", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		cpu.should.include.key(register);
		cpu[register].should.respondTo("getValue", register);
		cpu[register].should.respondTo("setValue", register);
	});
})({
	locales: {
		es: "incluye todos los registros",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("all registers start from 0", () => {
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		cpu[register].getValue().should.equalN(0, register);
	});
})({
	locales: {
		es: "todos los registros comienzan en 0",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("8-bit registers can save and read values (valid range)", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp"].forEach((register) => {
		for (let i = 0; i < 256; i++) {
			cpu[register].setValue(i);
			cpu[register].getValue().should.equalN(i, `${register}.getValue()`);
		}
	});
})({
	locales: {
		es: "los registros de 8 bits pueden guardar y leer valores (rango válido)",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("8-bit registers wrap with values outside the range", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp"].forEach((register) => {
		for (let i = -300; i < 600; i++) {
			const array = new Uint8Array(1);
			array[0] = i;
			cpu[register].setValue(i);
			cpu[register]
				.getValue()
				.should.equalN(array[0], `${register}.getValue()`);
		}
	});
})({
	locales: {
		es: "los registros de 8 bits dan la vuelta con valores fuera del rango",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("16-bit registers can save and read values (valid range)", () => {
	const cpu = newCPU();

	for (let i = 0; i < 65536; i++) {
		cpu.pc.setValue(i);
		cpu.pc.getValue().should.equalHex(i, "getValue()");
	}
})({
	locales: {
		es: "los registros de 16 bits pueden guardar y leer valores (rango válido)",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("16-bit registers wrap with values outside the range", () => {
	const cpu = newCPU();

	for (let i = -300; i < 65800; i++) {
		const array = new Uint16Array(1);
		array[0] = i;
		cpu.pc.setValue(i);
		cpu.pc.getValue().should.equal(array[0], i);
	}
})({
	locales: {
		es: "los registros de 16 bits dan la vuelta con valores fuera del rango",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

// 5a.3 Flags

it("includes a `flags` property with 6 booleans", () => {
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

	cpu.should.include.key("flags");
	expect(cpu.flags).to.be.an("object");

	["c", "z", "i", "d", "v", "n"].forEach((flag) => {
		cpu.flags.should.include.key(flag);
		expect(cpu.flags[flag]).to.be.an("boolean", flag);
		cpu.flags[flag].should.be.false;
	});
})({
	locales: {
		es: "incluye una propiedad `flags` con 6 booleanos",
	},
	use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("flags register can be serialized into a byte", () => {
	const cpu = newCPU();
	cpu.flags.i = false;

	cpu.flags.getValue().should.equalBin(0b00100000, "getValue()");
	cpu.flags.z = true;
	cpu.flags.getValue().should.equalBin(0b00100010, "[+z] => getValue()");
	cpu.flags.c = true;
	cpu.flags.getValue().should.equalBin(0b00100011, "[+c] => getValue()");
	cpu.flags.v = true;
	cpu.flags.getValue().should.equalBin(0b01100011, "[+v] => getValue()");
	cpu.flags.n = true;
	cpu.flags.getValue().should.equalBin(0b11100011, "[+n] => getValue()");
	cpu.flags.i = true;
	cpu.flags.getValue().should.equalBin(0b11100111, "[+i] => getValue()");
	cpu.flags.d = true;
	cpu.flags.getValue().should.equalBin(0b11101111, "[+d] => getValue()");
	cpu.flags.c = false;
	cpu.flags.getValue().should.equalBin(0b11101110, "[-c] => getValue()");
	cpu.flags.v = false;
	cpu.flags.getValue().should.equalBin(0b10101110, "[-v] => getValue()");
	cpu.flags.z = false;
	cpu.flags.getValue().should.equalBin(0b10101100, "[-z] => getValue()");
})({
	locales: {
		es: "el registro de flags puede ser serializado en un byte",
	},
	use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("flags register can be set from a byte", () => {
	const cpu = newCPU();

	cpu.flags.setValue(0b11111111);
	cpu.flags.getValue().should.equalBin(0b11101111, "getValue()");
	cpu.flags.c.should.be.true;
	cpu.flags.z.should.be.true;
	cpu.flags.i.should.be.true;
	cpu.flags.d.should.be.true;
	cpu.flags.v.should.be.true;
	cpu.flags.n.should.be.true;

	cpu.flags.setValue(0b01000001);
	cpu.flags.getValue().should.equalBin(0b01100001, "getValue()");
	cpu.flags.c.should.be.true;
	cpu.flags.z.should.be.false;
	cpu.flags.i.should.be.false;
	cpu.flags.d.should.be.false;
	cpu.flags.v.should.be.true;
	cpu.flags.n.should.be.false;

	cpu.flags.setValue(0b10000011);
	cpu.flags.getValue().should.equalBin(0b10100011, "getValue()");
	cpu.flags.c.should.be.true;
	cpu.flags.z.should.be.true;
	cpu.flags.i.should.be.false;
	cpu.flags.d.should.be.false;
	cpu.flags.v.should.be.false;
	cpu.flags.n.should.be.true;
})({
	locales: {
		es: "el registro de flags puede ser asignado desde un byte",
	},
	use: ({ id }, book) => id >= book.getId("5a.3"),
});

// 5a.4 Helpers

it("can increment and decrement registers", () => {
	const cpu = newCPU();
	const a = cpu.a.getValue();
	const pc = cpu.pc.getValue();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		cpu[register].should.respondTo("increment", register);
		cpu[register].should.respondTo("decrement", register);
	});

	cpu.a.increment();
	cpu.a.increment();
	cpu.a.increment();
	cpu.a.decrement();

	cpu.pc.increment();
	cpu.pc.increment();
	cpu.pc.increment();
	cpu.pc.increment();
	cpu.pc.decrement();
	cpu.pc.decrement();

	cpu.a.getValue().should.equalN(a + 3 - 1, "getValue()");
	cpu.pc.getValue().should.equalHex(pc + 4 - 2, "getValue()");
})({
	locales: {
		es: "puede incrementar y decrementar registros",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Zero Flag", () => {
	const cpu = newCPU();

	cpu.flags.should.respondTo("updateZero");

	cpu.flags.updateZero(0);
	cpu.flags.z.should.be.true;

	cpu.flags.updateZero(50);
	cpu.flags.z.should.be.false;
})({
	locales: {
		es: "puede actualizar la Bandera Zero",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Negative Flag", () => {
	const cpu = newCPU();

	cpu.flags.should.respondTo("updateNegative");

	cpu.flags.updateNegative(2);
	cpu.flags.n.should.be.false;

	cpu.flags.updateNegative(129);
	cpu.flags.n.should.be.true;
})({
	locales: {
		es: "puede actualizar la Bandera Negative",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Zero and Negative flags", () => {
	const cpu = newCPU();

	cpu.flags.should.respondTo("updateZeroAndNegative");
	sinon.spy(cpu.flags, "updateZero");
	sinon.spy(cpu.flags, "updateNegative");

	cpu.flags.updateZeroAndNegative(28);
	cpu.flags.updateZero.should.have.been.calledWith(28);
	cpu.flags.updateNegative.should.have.been.calledWith(28);
})({
	locales: {
		es: "puede actualizar las Banderas Zero y Negative",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

// 5a.5 Stack

it("includes a `stack` property with `push`/`pop` methods", () => {
	const cpu = newCPU();

	cpu.should.include.key("stack");
	expect(cpu.stack).to.be.an("object");

	cpu.stack.should.respondTo("push");
	cpu.stack.should.respondTo("pop");
})({
	locales: {
		es: "incluye una propiedad `stack` con métodos `push`/`pop`",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

it("the stack can push and pop values", () => {
	const { stack, sp } = newCPU();
	sp.setValue(0xff);

	const bytes = [];
	for (let i = 0; i < 256; i++) bytes.push(byte.random());

	for (let i = 0; i < 256; i++) stack.push(bytes[i]);
	for (let i = 255; i <= 0; i--)
		stack.pop().should.equalHex(bytes[i], `[${i}] pop()`);
})({
	locales: {
		es: "la pila puede poner y sacar elementos",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

it("the stack updates RAM and decrements [SP] on push", () => {
	const { stack, memory, sp } = newCPU();
	sp.setValue(0xff);

	const value = byte.random();
	stack.push(value);
	memory.read(0x0100 + 0xff).should.equalHex(value, "read(...)");
	sp.getValue().should.equalHex(0xfe, "getValue()");
})({
	locales: {
		es: "la pila actualiza RAM y [SP] al poner",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

it("the stack reads RAM and increments [SP] on pop", () => {
	const { stack, memory, sp } = newCPU();
	sp.setValue(0xff);

	stack.push(byte.random());
	const value = byte.random();
	memory.write(0x0100 + 0xff, value);
	stack.pop().should.equalHex(value, "pop()");
	sp.getValue().should.equalHex(0xff, "getValue()");
})({
	locales: {
		es: "la pila lee RAM e incrementa [SP] al sacar",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

// 5a.6 Little Endian

it("can read 16-bit values from the memory bus", () => {
	const cpu = newCPU([0x34, 0x12]);

	cpu.memory.write(0x0050, 0x45);
	cpu.memory.write(0x0051, 0x23);

	cpu.memory.should.respondTo("read16");
	cpu.memory.read16(0x0050).should.equalHex(0x2345, "read16(...)");
	cpu.memory.read16(0x8000).should.equalHex(0x1234, "read16(...)");
})({
	locales: {
		es: "puede leer valores de 16 bits del bus de memoria",
	},
	use: ({ id }, book) => id >= book.getId("5a.6"),
});

it("can push 16-bit values onto the stack", () => {
	const cpu = newCPU();

	cpu.stack.should.respondTo("push16");
	cpu.stack.push16(0x1234);

	cpu.stack.pop().should.equalHex(0x34, "pop()");
	cpu.stack.pop().should.equalHex(0x12, "pop()");
})({
	locales: {
		es: "puede poner valores de 16 bits en la pila",
	},
	use: ({ id }, book) => id >= book.getId("5a.6"),
});

it("can pop 16-bit values from the stack", () => {
	const cpu = newCPU();

	cpu.stack.push(0x12);
	cpu.stack.push(0x34);

	cpu.stack.should.respondTo("pop16");
	cpu.stack.pop16().should.equalHex(0x1234, "pop16()");
})({
	locales: {
		es: "puede sacar valores de 16 bits de la pila",
	},
	use: ({ id }, book) => id >= book.getId("5a.6"),
});

// 5a.14 Operations

it("defines a list of 151 `operations`", () => {
	const cpu = newCPU();

	cpu.should.include.key("operations");
	Array.isArray(cpu.operations).should.equalN(true, "isArray(...)");
	let count = 0;

	for (let operation of cpu.operations) {
		if (operation == null) continue;

		operation.should.include.key("id");
		operation.should.include.key("instruction");
		operation.should.include.key("cycles");
		operation.should.include.key("addressingMode");
		operation.instruction.should.include.key("id");
		operation.instruction.should.include.key("argument");
		operation.instruction.should.respondTo("run");
		operation.addressingMode.should.include.key("id");
		operation.addressingMode.should.include.key("inputSize");
		operation.addressingMode.should.respondTo("getAddress");
		operation.addressingMode.should.respondTo("getValue");
		count++;
	}

	count.should.equalN(151, "count");
})({
	locales: {
		es: "define una lista con 151 `operations`",
	},
	use: ({ id }, book) => id >= book.getId("5a.14"),
});

// 5a.15 Execute

it("can run 4 simple operations, updating all counters, and calling a `logger` function", () => {
	// NOP ; LDA #$05 ; STA $0201 ; LDX $0201
	const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
	cpu.should.respondTo("step");
	let cycles;
	cpu.pc.setValue(0x8000);
	cpu.cycle = 7;

	// NOP
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	cycles.should.equalN(2, "NOP => cycles");
	cpu.pc.getValue().should.equalHex(0x8001, "NOP => pc");
	cpu.cycle.should.equalN(9, "NOP => cycle");
	cpu.logger.should.have.been.calledWith(
		cpu,
		0x8000,
		cpu.operations[0xea],
		null,
		null
	);

	// LDA #$05
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	cycles.should.equalN(2, "LDA #$05 => cycles");
	cpu.pc.getValue().should.equalHex(0x8003, "LDA #$05 => pc");
	cpu.cycle.should.equalN(11, "LDA #$05 => cycle");
	cpu.logger.should.have.been.calledWith(
		cpu,
		0x8001,
		cpu.operations[0xa9],
		0x05,
		0x05
	);

	// STA $0201
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	cycles.should.equalN(4, "STA $0201 => cycles");
	cpu.pc.getValue().should.equalHex(0x8006, "STA $0201 => pc");
	cpu.cycle.should.equalN(15, "STA $0201 => cycle");
	cpu.logger.should.have.been.calledWith(
		cpu,
		0x8003,
		cpu.operations[0x8d],
		0x0201,
		0x0201
	);

	// LDX $0201
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	cycles.should.equalN(4, "LDX $0201 => cycles");
	cpu.pc.getValue().should.equalHex(0x8009, "LDX $0201 => pc");
	cpu.cycle.should.equalN(19, "LDX $0201 => cycle");
	cpu.logger.should.have.been.calledWith(
		cpu,
		0x8006,
		cpu.operations[0xae],
		0x0201,
		0x0005
	);
})({
	locales: {
		es:
			"puede ejecutar 4 operaciones simples, actualizando todos los contadores, y llamando a una función `logger`",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});
