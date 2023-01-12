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

// 4.1 New CPU

it("`/code/index.js` exports an object containing the `CPU` class", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("CPU");
	expect(mainModule.default.CPU).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase `CPU`",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

// 4.2 Registers

it("includes all the registers", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		cpu.should.include.key(register);
		cpu[register].should.respondTo("getValue");
		cpu[register].should.respondTo("setValue");
	});
})({
	locales: {
		es: "incluye todos los registros",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("all registers start from 0", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		cpu[register].getValue().should.equal(0);
	});
})({
	locales: {
		es: "todos los registros comienzan en 0",
	},
	use: ({ id }, book) => id >= book.getId("4.2") && id < book.getId("4.6"),
});

it("8-bit registers can save and read values (valid range)", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp"].forEach((register) => {
		for (let i = 0; i < 256; i++) {
			cpu[register].setValue(i);
			cpu[register].getValue().should.equal(i);
		}
	});
})({
	locales: {
		es: "los registros de 8 bits pueden guardar y leer valores (rango válido)",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("8-bit registers wrap with values outside the range", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp"].forEach((register) => {
		for (let i = -300; i < 600; i++) {
			const array = new Uint8Array(1);
			array[0] = i;
			cpu[register].setValue(i);
			cpu[register].getValue().should.equal(array[0]);
		}
	});
})({
	locales: {
		es: "los registros de 8 bits dan la vuelta con valores fuera del rango",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("16-bit registers can save and read values (valid range)", () => {
	const cpu = newCPU();

	for (let i = 0; i < 65536; i++) {
		cpu.pc.setValue(i);
		cpu.pc.getValue().should.equal(i);
	}
})({
	locales: {
		es: "los registros de 16 bits pueden guardar y leer valores (rango válido)",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("16-bit registers wrap with values outside the range", () => {
	const cpu = newCPU();

	for (let i = -300; i < 65800; i++) {
		const array = new Uint16Array(1);
		array[0] = i;
		cpu.pc.setValue(i);
		cpu.pc.getValue().should.equal(array[0]);
	}
})({
	locales: {
		es: "los registros de 16 bits dan la vuelta con valores fuera del rango",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

// 4.3 Flags

it("includes a `flags` property with 5 booleans", () => {
	const cpu = newCPU();

	cpu.should.include.key("flags");
	expect(cpu.flags).to.be.an("object");

	["c", "z", "i", "v", "n"].forEach((flag) => {
		cpu.flags.should.include.key(flag);
		expect(cpu.flags[flag]).to.be.an("boolean");
		cpu.flags[flag].should.be.false;
	});
})({
	locales: {
		es: "incluye una propiedad `flag` con 5 booleanos",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("flags register can be serialized into a byte", () => {
	const cpu = newCPU();

	cpu.flags.getValue().should.equal(0b00100000);
	cpu.flags.z = true;
	cpu.flags.getValue().should.equal(0b00100010);
	cpu.flags.c = true;
	cpu.flags.getValue().should.equal(0b00100011);
	cpu.flags.v = true;
	cpu.flags.getValue().should.equal(0b01100011);
	cpu.flags.n = true;
	cpu.flags.getValue().should.equal(0b11100011);
	cpu.flags.i = true;
	cpu.flags.getValue().should.equal(0b11100111);
	cpu.flags.c = false;
	cpu.flags.getValue().should.equal(0b11100110);
	cpu.flags.v = false;
	cpu.flags.getValue().should.equal(0b10100110);
	cpu.flags.z = false;
	cpu.flags.getValue().should.equal(0b10100100);
})({
	locales: {
		es: "el registro de flags puede ser serializado en un byte",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

it("flags register can be set from a byte", () => {
	const cpu = newCPU();

	cpu.flags.setValue(0b11111111);
	cpu.flags.getValue().should.equal(0b11100111);
	cpu.flags.c.should.be.true;
	cpu.flags.z.should.be.true;
	cpu.flags.i.should.be.true;
	cpu.flags.v.should.be.true;
	cpu.flags.n.should.be.true;

	cpu.flags.setValue(0b01000001);
	cpu.flags.getValue().should.equal(0b01100001);
	cpu.flags.c.should.be.true;
	cpu.flags.z.should.be.false;
	cpu.flags.i.should.be.false;
	cpu.flags.v.should.be.true;
	cpu.flags.n.should.be.false;

	cpu.flags.setValue(0b10000011);
	cpu.flags.getValue().should.equal(0b10100011);
	cpu.flags.c.should.be.true;
	cpu.flags.z.should.be.true;
	cpu.flags.i.should.be.false;
	cpu.flags.v.should.be.false;
	cpu.flags.n.should.be.true;
})({
	locales: {
		es: "el registro de flags puede ser asignado desde un byte",
	},
	use: ({ id }, book) => id >= book.getId("4.3"),
});

// 4.4 Memory

it("includes a `memory` property with `ram` and `read`/`write` methods", () => {
	const cpu = newCPU();

	cpu.should.include.key("memory");
	expect(cpu.memory).to.be.an("object");

	cpu.memory.ram.should.be.a("Uint8Array");
	cpu.memory.should.respondTo("read");
	cpu.memory.should.respondTo("write");
})({
	locales: {
		es: "incluye una propiedad `memory` con `ram` y métodos `read`/`write`",
	},
	use: ({ id }, book) => id >= book.getId("4.4"),
});

it("can read from RAM", () => {
	const cpu = newCPU();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		cpu.memory.ram[i] = value;
		cpu.memory.read(i).should.equal(value);
	}
})({
	locales: {
		es: "puede leer de RAM",
	},
	use: ({ id }, book) => id >= book.getId("4.4"),
});

it("reading RAM mirror results in RAM reads", () => {
	const cpu = newCPU();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		cpu.memory.ram[(i - 0x0800) % 0x0800] = value;
		cpu.memory.read(i).should.equal(value);
	}
})({
	locales: {
		es: "leer espejo de RAM ocasiona lecturas de RAM",
	},
	use: ({ id }, book) => id >= book.getId("4.4"),
});

it("can write to RAM", () => {
	const cpu = newCPU();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		cpu.memory.write(i, value);
		cpu.memory.ram[i].should.equal(value);
	}
})({
	locales: {
		es: "puede escribir en RAM",
	},
	use: ({ id }, book) => id >= book.getId("4.4"),
});

it("writing RAM mirror results in RAM writes", () => {
	const cpu = newCPU();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		cpu.memory.write(i, value);
		cpu.memory.ram[(i - 0x0800) % 0x0800].should.equal(value);
	}
})({
	locales: {
		es: "escribir espejo de RAM ocasiona escrituras en RAM",
	},
	use: ({ id }, book) => id >= book.getId("4.4"),
});

// 4.5 Insert cartridge

it("`/code/index.js` exports an object containing the `NEEES` class", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("NEEES");
	expect(mainModule.default.NEEES).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase `NEEES`",
	},
	use: ({ id }, book) => id >= book.getId("4.5"),
});

it("instantiating a `NEEES` with a ROM creates a `cartridge`", () => {
	const { NEEES, Cartridge } = mainModule.default;
	const neees = new NEEES(newRom());

	neees.should.include.key("cartridge");
	expect(neees.cartridge).to.be.an("object");
	neees.cartridge.should.be.an.instanceof(Cartridge);
})({
	locales: {
		es: "instanciar una `NEEES` con una ROM crea un `cartridge`",
	},
	use: ({ id }, book) => id >= book.getId("4.5"),
});

it("instantiating a `NEEES` with a ROM creates a `cpu`", () => {
	const { NEEES, CPU } = mainModule.default;
	const neees = new NEEES(newRom());

	neees.should.include.key("cpu");
	expect(neees.cpu).to.be.an("object");
	neees.cpu.should.be.an.instanceof(CPU);
})({
	locales: {
		es: "instanciar una `NEEES` con una ROM crea una `cpu`",
	},
	use: ({ id }, book) => id >= book.getId("4.5"),
});

it("PRG-ROM code is mapped to $8000-$BFFF", () => {
	const { CPU, Cartridge } = mainModule.default;

	const code = [];
	for (let i = 0; i < 16384; i++) code.push(byte.random());

	const cpu = new CPU(new Cartridge(newRom(code)));

	for (let i = 0; i < 16384; i++)
		cpu.memory.read(0x8000 + i).should.equal(code[i]);
})({
	locales: {
		es: "el código PRG-ROM está mapeado a $8000-$BFFF",
	},
	use: ({ id }, book) => id >= book.getId("4.5"),
});

it("PRG-ROM code is read only", () => {
	const { CPU, Cartridge } = mainModule.default;

	const code = [];
	for (let i = 0; i < 16384; i++) code.push(byte.random());

	const cpu = new CPU(new Cartridge(newRom(code)));

	for (let i = 0; i < 16384; i++) {
		const value = cpu.memory.read(0x8000 + i);
		cpu.memory.write(0x8000 + i, byte.random());
		cpu.memory.read(0x8000 + i).should.equal(value);
	}
})({
	locales: {
		es: "el código PRG-ROM es solo lectura",
	},
	use: ({ id }, book) => id >= book.getId("4.5"),
});

it("the `prg()` method is called only one time", () => {
	const { CPU, Cartridge } = mainModule.default;

	const code = [1, 2, 3];
	const cartridge = new Cartridge(newRom(code));
	sinon.spy(cartridge, "prg");
	const cpu = new CPU(cartridge);

	cpu.memory.read(0x8000);
	cpu.memory.read(0x8000);
	cpu.memory.read(0x8000);

	try {
		cartridge.prg.should.have.been.calledOnce;
	} catch (e) {
		throw new Error(e.message.split("\n")[0]);
	}
})({
	locales: {
		es: "el método `prg()` se llama solo una vez",
	},
	use: ({ id }, book) => id >= book.getId("4.5"),
});

// 4.6 Execute (1/2)

it("all registers start from 0, except for [PC], which starts from $8000", () => {
	const cpu = newCPU();

	["a", "x", "y", "sp"].forEach((register) => {
		cpu[register].getValue().should.equal(0);
	});
	cpu.pc.getValue().should.equal(0x8000);
})({
	locales: {
		es:
			"todos los registros comienzan en 0, excepto [PC], que comienza en $8000",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

it("opcode $E8 means `INX`, which increments the [X] register", () => {
	const cpu = newCPU([0xe8]);

	cpu.x.getValue().should.equal(0);
	cpu.step();
	cpu.x.getValue().should.equal(1);
})({
	locales: {
		es: "el opcode $E8 es `INX`, que incrementa el registro [X]",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

it("opcode $C8 means `INY`, which increments the [Y] register", () => {
	const cpu = newCPU([0xc8]);

	cpu.y.getValue().should.equal(0);
	cpu.step();
	cpu.y.getValue().should.equal(1);
})({
	locales: {
		es: "el opcode $C8 es `INY`, que incrementa el registro [Y]",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

it("opcode $8A means `TXA`, which transfers [X] to [A]", () => {
	const cpu = newCPU([0x8a]);
	cpu.x.setValue(123);

	cpu.a.getValue().should.equal(0);
	cpu.step();
	cpu.a.getValue().should.equal(123);
})({
	locales: {
		es: "el opcode $8A es `TXA`, que transfiere [X] a [A]",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

it("after a `step()` call, [PC] is incremented", () => {
	const cpu = newCPU([0xe8]);

	cpu.step();
	cpu.pc.getValue().should.equal(0x8001);
})({
	locales: {
		es: "luego de una llamada a `step()`, [PC] es incrementado",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

it("supports combinations of `INX`, `INY` and `TXA`", () => {
	const cpu = newCPU([0xe8, 0xc8, 0xe8, 0x8a]); // INX, INY, INX, TXA

	cpu.step();
	cpu.step();
	cpu.step();
	cpu.step();
	cpu.x.getValue().should.equal(2);
	cpu.y.getValue().should.equal(1);
	cpu.a.getValue().should.equal(2);
	cpu.pc.getValue().should.equal(0x8004);
})({
	locales: {
		es: "soporta combinaciones de `INX`, `INY` y `TXA`",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

it("throws an error on unsupported opcodes", () => {
	const cpu = newCPU([0xff]);

	expect(() => cpu.step()).to.throw(Error, "Invalid opcode.");
})({
	locales: {
		es: "tira un error con opcodes no soportados",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

it("`NEEES::step()` calls `CPU::step()` once", () => {
	const NEEES = mainModule.default.NEEES;
	const neees = new NEEES(newRom([0xe8, 0xe8, 0xe8]));

	neees.cpu.step = sinon.spy();
	neees.step();
	neees.cpu.step.should.have.been.calledOnce;
})({
	locales: {
		es: "`NEEES::step()` llama a `CPU::step()` una vez",
	},
	use: ({ id }, book) => id >= book.getId("4.6"),
});

// 4.8 Stack

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
	use: ({ id }, book) => id >= book.getId("4.8"),
});

it("the stack can push and pop values", () => {
	const { stack, sp } = newCPU();
	sp.setValue(0xff);

	const bytes = [];
	for (let i = 0; i < 256; i++) bytes.push(byte.random());

	for (let i = 0; i < 256; i++) stack.push(bytes[i]);
	for (let i = 255; i <= 0; i--) stack.pop().should.equal(bytes[i]);
})({
	locales: {
		es: "la pila puede poner y sacar elementos",
	},
	use: ({ id }, book) => id >= book.getId("4.8"),
});

it("the stack updates RAM and decrements [SP] on push", () => {
	const { stack, memory, sp } = newCPU();
	sp.setValue(0xff);

	const value = byte.random();
	stack.push(value);
	memory.read(0x0100 + 0xff).should.equal(value);
	sp.getValue().should.equal(0xfe);
})({
	locales: {
		es: "la pila actualiza RAM y [SP] al poner",
	},
	use: ({ id }, book) => id >= book.getId("4.8"),
});

it("the stack reads RAM and increments [SP] on pop", () => {
	const { stack, memory, sp } = newCPU();
	sp.setValue(0xff);

	stack.push(byte.random());
	const value = byte.random();
	memory.write(0x0100 + 0xff, value);
	stack.pop().should.equal(value);
	sp.getValue().should.equal(0xff);
})({
	locales: {
		es: "la pila lee RAM e incrementa [SP] al sacar",
	},
	use: ({ id }, book) => id >= book.getId("4.8"),
});

// 4.9 Little Endian

it("can read 16-bit values from the memory bus", () => {
	const cpu = newCPU([0x34, 0x12]);

	cpu.memory.write(0x0050, 0x45);
	cpu.memory.write(0x0051, 0x23);

	cpu.memory.should.respondTo("read16");
	cpu.memory.read16(0x0050).should.equal(0x2345);
	cpu.memory.read16(0x8000).should.equal(0x1234);
})({
	locales: {
		es: "puede leer valores de 16 bits del bus de memoria",
	},
	use: ({ id }, book) => id >= book.getId("4.9"),
});

it("can push 16-bit values onto the stack", () => {
	const cpu = newCPU();

	cpu.stack.should.respondTo("push16");
	cpu.stack.push16(0x1234);

	cpu.stack.pop().should.equal(0x34);
	cpu.stack.pop().should.equal(0x12);
})({
	locales: {
		es: "puede poner valores de 16 bits en la pila",
	},
	use: ({ id }, book) => id >= book.getId("4.9"),
});

it("can pop 16-bit values from the stack", () => {
	const cpu = newCPU();

	cpu.stack.push(0x12);
	cpu.stack.push(0x34);

	cpu.stack.should.respondTo("pop16");
	cpu.stack.pop16().should.equal(0x1234);
})({
	locales: {
		es: "puede sacar valores de 16 bits de la pila",
	},
	use: ({ id }, book) => id >= book.getId("4.9"),
});

// 4.10 Helpers

it("can increment and decrement registers", () => {
	const cpu = newCPU();
	const a = cpu.a.getValue();
	const pc = cpu.pc.getValue();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		cpu[register].should.respondTo("increment");
		cpu[register].should.respondTo("decrement");
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

	cpu.a.getValue().should.equal(a + 3 - 1);
	cpu.pc.getValue().should.equal(pc + 4 - 2);
})({
	locales: {
		es: "puede incrementar y decrementar registros",
	},
	use: ({ id }, book) => id >= book.getId("4.10"),
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
	use: ({ id }, book) => id >= book.getId("4.10"),
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
	use: ({ id }, book) => id >= book.getId("4.10"),
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
	use: ({ id }, book) => id >= book.getId("4.10"),
});
