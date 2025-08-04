const { EmulatorBuilder, testHelpers, evaluate, byte } = $;

const $$ = (obj) => JSON.parse(JSON.stringify(obj));

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

it("the file `/code/index.js` exports <an object> containing the `CPU` class", () => {
	expect(mainModule.default).to.be.an("object");
	expect(mainModule.default).to.include.key("CPU");
	expect(mainModule.default.CPU).to.be.a.class;
})({
	locales: {
		es:
			"el archivo `/code/index.js` exporta <un objeto> que contiene la clase `CPU`",
	},
	use: ({ id }, book) => id >= book.getId("5a.1"),
});

it("includes a `memory` property with the <received> `cpuMemory`", () => {
	const CPU = mainModule.default.CPU;
	const CPUMemory = mainModule.default.CPUMemory;
	const cpuMemory = new CPUMemory();

	const cpu = new CPU(cpuMemory);
	expect(cpu).to.include.key("memory");
	expect(cpu.memory).to.equalN(cpuMemory, "memory");
})({
	locales: {
		es: "incluye una propiedad `memory` con la `cpuMemory` <recibida>",
	},
	use: ({ id }, book) => id >= book.getId("5a.1"),
});

it("includes two <mysterious properties>: `cycle` and `extraCycles`", () => {
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

	["cycle", "extraCycles"].forEach((property) => {
		expect(cpu).to.include.key(property);
		expect(cpu[property]).to.equalN(0, property);
	});
})({
	locales: {
		es: "incluye dos <propiedades misteriosas>: `cycle` y `extraCycles`",
	},
	use: ({ id }, book) => id >= book.getId("5a.1"),
});

// 5a.2 Registers

it("includes all the registers", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		expect(cpu).to.include.key(register);
		expect(cpu[register], register).to.respondTo("getValue");
		expect(cpu[register], register).to.respondTo("setValue");
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
		expect(cpu[register].getValue()).to.equalN(0, register);
	});
})({
	locales: {
		es: "todos los registros comienzan en 0",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("`Register8Bit`: can save and read values (<valid> range)", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp"].forEach((register) => {
		for (let i = 0; i < 256; i++) {
			cpu[register].setValue(i);
			expect(cpu[register].getValue()).to.equalN(i, `${register}.getValue()`);
		}
	});
})({
	locales: {
		es: "`Register8Bit`: puede guardar y leer valores (rango <válido>)",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("`Register8Bit`: wraps with values <outside> the range", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp"].forEach((register) => {
		for (let i = -300; i < 600; i++) {
			const array = new Uint8Array(1);
			array[0] = i;
			cpu[register].setValue(i);
			expect(cpu[register].getValue()).to.equalN(
				array[0],
				`${register}.getValue()`
			);
		}
	});
})({
	locales: {
		es: "`Register8Bit`: da la vuelta con valores <fuera> del rango",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("`Register16Bit`: can save and read values (<valid> range)", () => {
	const cpu = newCPU();

	for (let i = 0; i < 65536; i++) {
		cpu.pc.setValue(i);
		expect(cpu.pc.getValue()).to.equalHex(i, "pc.getValue()");
	}
})({
	locales: {
		es: "`Register16Bit`: puede guardar y leer valores (rango <válido>)",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

it("`Register16Bit`: wraps with values <outside> the range", () => {
	const cpu = newCPU();

	for (let i = -300; i < 65800; i++) {
		const array = new Uint16Array(1);
		array[0] = i;
		cpu.pc.setValue(i);
		expect(cpu.pc.getValue()).to.equalN(array[0], i);
	}
})({
	locales: {
		es: "`Register16Bit`: da la vuelta con valores <fuera> del rango",
	},
	use: ({ id }, book) => id >= book.getId("5a.2"),
});

// 5a.3 Flags

it("includes a `flags` property with 6 booleans", () => {
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

	expect(cpu).to.include.key("flags");
	expect(cpu.flags).to.be.an("object");

	["c", "z", "i", "d", "v", "n"].forEach((flag) => {
		expect(cpu.flags).to.include.key(flag);
		expect(cpu.flags[flag], `flags[${flag}]`).to.be.an("boolean", flag);
		expect(cpu.flags[flag]).to.equalN(false, flag);
	});
})({
	locales: {
		es: "incluye una propiedad `flags` con 6 booleanos",
	},
	use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can be <serialized> into a byte", () => {
	const cpu = newCPU();
	cpu.flags.i = false;

	expect(cpu.flags.getValue()).to.equalBin(0b00100000, "getValue()");
	cpu.flags.z = true;
	expect(cpu.flags.getValue()).to.equalBin(0b00100010, "[+z] => getValue()");
	cpu.flags.c = true;
	expect(cpu.flags.getValue()).to.equalBin(0b00100011, "[+c] => getValue()");
	cpu.flags.v = true;
	expect(cpu.flags.getValue()).to.equalBin(0b01100011, "[+v] => getValue()");
	cpu.flags.n = true;
	expect(cpu.flags.getValue()).to.equalBin(0b11100011, "[+n] => getValue()");
	cpu.flags.i = true;
	expect(cpu.flags.getValue()).to.equalBin(0b11100111, "[+i] => getValue()");
	cpu.flags.d = true;
	expect(cpu.flags.getValue()).to.equalBin(0b11101111, "[+d] => getValue()");
	cpu.flags.c = false;
	expect(cpu.flags.getValue()).to.equalBin(0b11101110, "[-c] => getValue()");
	cpu.flags.v = false;
	expect(cpu.flags.getValue()).to.equalBin(0b10101110, "[-v] => getValue()");
	cpu.flags.z = false;
	expect(cpu.flags.getValue()).to.equalBin(0b10101100, "[-z] => getValue()");
})({
	locales: {
		es: "`FlagsRegister`: puede ser <serializado> en un byte",
	},
	use: ({ id }, book) => id >= book.getId("5a.3"),
});

it("`FlagsRegister`: can be <set> from a byte", () => {
	const cpu = newCPU();

	cpu.flags.setValue(0b11111111);
	expect(cpu.flags.getValue()).to.equalBin(0b11101111, "getValue()");
	expect(cpu.flags.c).to.equalN(true, "c");
	expect(cpu.flags.z).to.equalN(true, "z");
	expect(cpu.flags.i).to.equalN(true, "i");
	expect(cpu.flags.d).to.equalN(true, "d");
	expect(cpu.flags.v).to.equalN(true, "v");
	expect(cpu.flags.n).to.equalN(true, "n");

	cpu.flags.setValue(0b01000001);
	expect(cpu.flags.getValue()).to.equalBin(0b01100001, "getValue()");
	expect(cpu.flags.c).to.equalN(true, "c");
	expect(cpu.flags.z).to.equalN(false, "z");
	expect(cpu.flags.i).to.equalN(false, "i");
	expect(cpu.flags.d).to.equalN(false, "d");
	expect(cpu.flags.v).to.equalN(true, "v");
	expect(cpu.flags.n).to.equalN(false, "n");

	cpu.flags.setValue(0b10000011);
	expect(cpu.flags.getValue()).to.equalBin(0b10100011, "getValue()");
	expect(cpu.flags.c).to.equalN(true, "c");
	expect(cpu.flags.z).to.equalN(true, "z");
	expect(cpu.flags.i).to.equalN(false, "i");
	expect(cpu.flags.d).to.equalN(false, "d");
	expect(cpu.flags.v).to.equalN(false, "v");
	expect(cpu.flags.n).to.equalN(true, "n");
})({
	locales: {
		es: "`FlagsRegister`: puede ser <asignado> desde un byte",
	},
	use: ({ id }, book) => id >= book.getId("5a.3"),
});

// 5a.4 Helpers

it("can <increment> and <decrement> registers", () => {
	const cpu = newCPU();
	const a = cpu.a.getValue();
	const pc = cpu.pc.getValue();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		expect(cpu[register], register).to.respondTo("increment");
		expect(cpu[register], register).to.respondTo("decrement");
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

	expect(cpu.a.getValue()).to.equalN(a + 3 - 1, "getValue()");
	expect(cpu.pc.getValue()).to.equalHex(pc + 4 - 2, "getValue()");
})({
	locales: {
		es: "puede <incrementar> y <decrementar> registros",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Zero Flag", () => {
	const cpu = newCPU();

	expect(cpu.flags).to.respondTo("updateZero");

	cpu.flags.updateZero(0);
	expect(cpu.flags.z).to.equalN(true, "z");

	cpu.flags.updateZero(50);
	expect(cpu.flags.z).to.equalN(false, "z");
})({
	locales: {
		es: "puede actualizar la Bandera Zero",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Negative Flag", () => {
	const cpu = newCPU();

	expect(cpu.flags).to.respondTo("updateNegative");

	cpu.flags.updateNegative(2);
	expect(cpu.flags.n).to.equalN(false, "n");

	cpu.flags.updateNegative(129);
	expect(cpu.flags.n).to.equalN(true, "n");
})({
	locales: {
		es: "puede actualizar la Bandera Negative",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

it("can update the Zero and Negative flags", () => {
	const cpu = newCPU();

	expect(cpu.flags).to.respondTo("updateZeroAndNegative");
	sinon.spy(cpu.flags, "updateZero");
	sinon.spy(cpu.flags, "updateNegative");

	cpu.flags.updateZeroAndNegative(28);
	expect(cpu.flags.updateZero).to.have.been.calledWith(28);
	expect(cpu.flags.updateNegative).to.have.been.calledWith(28);
})({
	locales: {
		es: "puede actualizar las Banderas Zero y Negative",
	},
	use: ({ id }, book) => id >= book.getId("5a.4"),
});

// 5a.5 Stack

it("includes a `stack` property with `push`/`pop` methods", () => {
	const cpu = newCPU();

	expect(cpu).to.include.key("stack");
	expect(cpu.stack).to.be.an("object");

	expect(cpu.stack).to.respondTo("push");
	expect(cpu.stack).to.respondTo("pop");
})({
	locales: {
		es: "incluye una propiedad `stack` con métodos `push`/`pop`",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

it("`Stack`: can push and pop values", () => {
	const { stack, sp } = newCPU();
	sp.setValue(0xff);

	const bytes = [];
	for (let i = 0; i < 256; i++) bytes.push(byte.random());

	for (let i = 0; i < 256; i++) stack.push(bytes[i]);
	for (let i = 255; i <= 0; i--)
		expect(stack.pop()).to.equalHex(bytes[i], `[${i}] pop()`);
})({
	locales: {
		es: "`Stack`: puede poner y sacar elementos",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

it("`Stack`: `push(...)` updates RAM and decrements [SP]", () => {
	const { stack, memory, sp } = newCPU();
	sp.setValue(0xff);

	const value = byte.random();
	stack.push(value);
	expect(memory.read(0x0100 + 0xff)).to.equalHex(value, "read(...)");
	expect(sp.getValue()).to.equalHex(0xfe, "getValue()");
})({
	locales: {
		es: "`Stack`: `push(...)` actualiza la RAM y decrementa [SP]",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

it("`Stack`: `pop()` reads RAM and increments [SP]", () => {
	const { stack, memory, sp } = newCPU();
	sp.setValue(0xff);

	stack.push(byte.random());
	const value = byte.random();
	memory.write(0x0100 + 0xff, value);
	expect(stack.pop()).to.equalHex(value, "pop()");
	expect(sp.getValue()).to.equalHex(0xff, "getValue()");
})({
	locales: {
		es: "`Stack`: `pop()` lee la RAM e incrementa [SP]",
	},
	use: ({ id }, book) => id >= book.getId("5a.5"),
});

// 5a.6 Little Endian

it("`CPUMemory`: `read16(...)` reads <16-bit values> from the memory bus", () => {
	const cpu = newCPU([0x34, 0x12]);

	cpu.memory.write(0x0050, 0x45);
	cpu.memory.write(0x0051, 0x23);

	expect(cpu.memory).to.respondTo("read16");
	expect(cpu.memory.read16(0x0050)).to.equalHex(0x2345, "read16(...)");
	expect(cpu.memory.read16(0x8000)).to.equalHex(0x1234, "read16(...)");
})({
	locales: {
		es:
			"`CPUMemory`: `read16(...)` puede leer <valores de 16 bits> del bus de memoria",
	},
	use: ({ id }, book) => id >= book.getId("5a.6"),
});

it("`Stack`: `push16(...)` pushes <16-bit values> onto the stack", () => {
	const cpu = newCPU();

	expect(cpu.stack).to.respondTo("push16");
	cpu.stack.push16(0x1234);

	expect(cpu.stack.pop()).to.equalHex(0x34, "pop()");
	expect(cpu.stack.pop()).to.equalHex(0x12, "pop()");
})({
	locales: {
		es: "`Stack`: `push16(...)` pone <valores de 16 bits> en la pila",
	},
	use: ({ id }, book) => id >= book.getId("5a.6"),
});

it("`Stack`: `pop16()` pops <16-bit values> from the stack", () => {
	const cpu = newCPU();

	cpu.stack.push(0x12);
	cpu.stack.push(0x34);

	expect(cpu.stack).to.respondTo("pop16");
	expect(cpu.stack.pop16()).to.equalHex(0x1234, "pop16()");
})({
	locales: {
		es: "`Stack`: `pop16()` saca <valores de 16 bits> de la pila",
	},
	use: ({ id }, book) => id >= book.getId("5a.6"),
});

// 5a.14 Operations

it("defines a list of 151 `operations`", () => {
	const cpu = newCPU();

	expect(cpu).to.include.key("operations");
	expect(Array.isArray(cpu.operations)).to.equalN(true, "isArray(...)");
	let count = 0;

	for (let operation of cpu.operations) {
		if (operation == null) continue;

		expect(operation).to.include.key("id");
		expect(operation).to.include.key("instruction");
		expect(operation).to.include.key("cycles");
		expect(operation).to.include.key("addressingMode");
		expect(operation.instruction).to.include.key("id");
		expect(operation.instruction).to.include.key("argument");
		expect(operation.instruction).to.respondTo("run");
		expect(operation.addressingMode).to.include.key("id");
		expect(operation.addressingMode).to.include.key("inputSize");
		expect(operation.addressingMode).to.respondTo("getAddress");
		expect(operation.addressingMode).to.respondTo("getValue");
		count++;
	}

	expect(count).to.equalN(151, "count");
})({
	locales: {
		es: "define una lista con 151 `operations`",
	},
	use: ({ id }, book) => id >= book.getId("5a.14"),
});

// 5a.15 Execute

it("can fetch the next operation", () => {
	const { instructions, addressingModes } = mainModule.default;

	// NOP ; LDA #$05 ; STA $0201 ; LDX $0201
	const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
	cpu.pc.setValue(0x8000);
	expect(cpu).to.respondTo("_fetchOperation");

	// NOP
	expect($$(cpu._fetchOperation())).to.eql(
		$$({
			id: 0xea,
			instruction: instructions.NOP,
			cycles: 2,
			addressingMode: addressingModes.IMPLICIT,
		})
	);

	// LDA #$05
	expect($$(cpu._fetchOperation())).to.eql(
		$$({
			id: 0xa9,
			instruction: instructions.LDA,
			cycles: 2,
			addressingMode: addressingModes.IMMEDIATE,
		})
	);

	// STA $0201
	cpu.pc.increment(); // skip input
	expect($$(cpu._fetchOperation())).to.eql(
		$$({
			id: 0x8d,
			instruction: instructions.STA,
			cycles: 4,
			addressingMode: addressingModes.ABSOLUTE,
		})
	);
})({
	locales: {
		es: "puede ir a buscar la próxima operación",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("throws an error when it finds an <invalid> opcode", () => {
	// ??? (0x02)
	const cpu = newCPU([0x02]);
	cpu.pc.setValue(0x8000);
	expect(cpu).to.respondTo("_fetchOperation");

	// 0x02
	expect(() => cpu._fetchOperation()).to.throw(Error, /Invalid opcode/);
})({
	locales: {
		es: "tira un error cuando encuentra un opcode <inválido>",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can fetch the <next input>", () => {
	// NOP ; LDA #$05 ; STA $0201 ; LDX $0201
	const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
	cpu.pc.setValue(0x8000);
	expect(cpu).to.respondTo("_fetchInput");

	// NOP
	cpu.pc.increment(); // skip opcode
	expect(cpu._fetchInput(cpu.operations[0xea])).to.equalN(
		null,
		"operations[0xea]"
	);

	// LDA #$05
	cpu.pc.increment(); // skip opcode
	expect(cpu._fetchInput(cpu.operations[0xa9])).to.equalHex(
		0x05,
		"operations[0xa9]"
	);

	// STA $0201
	cpu.pc.increment(); // skip opcode
	expect(cpu._fetchInput(cpu.operations[0x8d])).to.equalHex(
		0x0201,
		"operations[0x8d]"
	);
})({
	locales: {
		es: "puede ir a buscar el <próximo input>",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can fetch <the argument> based on `operation` and `input`", () => {
	const cpu = newCPU();
	expect(cpu).to.respondTo("_fetchArgument");

	// DEC $40,X
	cpu.x.setValue(6);
	expect(cpu._fetchArgument(cpu.operations[0xd6], 0x40)).to.equalHex(0x46);
})({
	locales: {
		es: "puede ir a buscar <el argumento> basándose en `operation` e `input`",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can add cycles based on `operation`", () => {
	const cpu = newCPU();
	expect(cpu).to.respondTo("_addCycles");

	// DEC $40,X (6 cycles)
	cpu.cycle = 3;
	cpu.extraCycles = 9;
	expect(cpu._addCycles(cpu.operations[0xd6])).to.equalN(15);
	expect(cpu.cycle).to.equalN(18);
	expect(cpu.extraCycles).to.equalN(0);
})({
	locales: {
		es: "puede agregar ciclos basándose en `operation`",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("can run 4 simple operations, updating all counters, and calling a `logger` function", () => {
	// NOP ; LDA #$05 ; STA $0201 ; LDX $0201
	const cpu = newCPU([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02]);
	expect(cpu).to.respondTo("step");
	let cycles;
	cpu.pc.setValue(0x8000);
	cpu.cycle = 7;

	// NOP
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equalN(2, "NOP => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8001, "NOP => pc");
	expect(cpu.cycle).to.equalN(9, "NOP => cycle");
	expect(cpu.logger).to.have.been.calledWith(
		cpu,
		0x8000,
		cpu.operations[0xea],
		null,
		null
	);

	// LDA #$05
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equalN(2, "LDA #$05 => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8003, "LDA #$05 => pc");
	expect(cpu.cycle).to.equalN(11, "LDA #$05 => cycle");
	expect(cpu.logger).to.have.been.calledWith(
		cpu,
		0x8001,
		cpu.operations[0xa9],
		0x05,
		0x05
	);

	// STA $0201
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equalN(4, "STA $0201 => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8006, "STA $0201 => pc");
	expect(cpu.cycle).to.equalN(15, "STA $0201 => cycle");
	expect(cpu.logger).to.have.been.calledWith(
		cpu,
		0x8003,
		cpu.operations[0x8d],
		0x0201,
		0x0201
	);

	// LDX $0201
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equalN(4, "LDX $0201 => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8009, "LDX $0201 => pc");
	expect(cpu.cycle).to.equalN(19, "LDX $0201 => cycle");
	expect(cpu.logger).to.have.been.calledWith(
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
