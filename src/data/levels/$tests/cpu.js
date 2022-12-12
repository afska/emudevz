const { evaluate, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

	["a", "x", "y", "sp", "pc"].forEach((register) => {
		cpu[register].getValue().should.equal(0);
	});
})({
	locales: {
		es: "todos los registros comienzan en 0",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("8-bit registers can save and read values (valid range)", () => {
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
	const CPU = mainModule.default.CPU;
	const cpu = new CPU();

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
