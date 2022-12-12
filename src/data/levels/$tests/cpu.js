const { evaluate, filesystem, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// 4.1 New CPU

it("`/code/index.js` exports an object containing the CPU class", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("CPU");
	expect(mainModule.default.CPU).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

// 4.2 Registers

it("it includes all the registers", () => {
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
