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

// 4.16 Addressing modes (1/2): Simple

it("`/code/index.js` exports an object containing the `addressingModes` object", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("addressingModes");
	expect(mainModule.default.addressingModes).to.be.an("object");
})({
	locales: {
		es:
			"`/code/index.js` exporta un objeto que contiene el objeto `addressingModes`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("every member of the `addressingModes` object has an `id`", () => {
	const instructions = mainModule.default.addressingModes;

	for (let key in instructions) {
		instructions[key].should.include.key("id");
		instructions[key].id.should.equal(key);
	}
})({
	locales: {
		es: "cada miembro del objeto `addressingModes` tiene un `id`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMPLICIT`: inputSize == 0", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("IMPLICIT");
	expect(addressingModes.IMPLICIT).to.be.an("object");
	addressingModes.IMPLICIT.inputSize.should.equal(0);
})({
	locales: {
		es: "`IMPLICIT`: inputSize == 0",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMPLICIT` / `getAddress`: returns null", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	expect(addressingModes.IMPLICIT.getAddress(cpu, 0)).to.equal(null);
})({
	locales: {
		es: "`IMPLICIT` / `getAddress`: retorna null",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMPLICIT` / `getValue`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.IMPLICIT.getValue(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`IMPLICIT` / `getValue`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMMEDIATE`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("IMMEDIATE");
	expect(addressingModes.IMMEDIATE).to.be.an("object");
	addressingModes.IMMEDIATE.inputSize.should.equal(1);
})({
	locales: {
		es: "`IMMEDIATE`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMMEDIATE` / `getAddress`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.IMMEDIATE.getAddress(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`IMMEDIATE` / `getAddress`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`IMMEDIATE` / `getValue`: returns the same value", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	addressingModes.IMMEDIATE.getValue(cpu, 123).should.equal(123);
})({
	locales: {
		es: "`IMMEDIATE` / `getValue`: retorna el mismo valor",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ABSOLUTE`: inputSize == 2", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("ABSOLUTE");
	expect(addressingModes.ABSOLUTE).to.be.an("object");
	addressingModes.ABSOLUTE.inputSize.should.equal(2);
})({
	locales: {
		es: "`ABSOLUTE`: inputSize == 2",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ABSOLUTE` / `getAddress`: returns the same address", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	addressingModes.ABSOLUTE.getAddress(cpu, 0x1234).should.equal(0x1234);
})({
	locales: {
		es: "`ABSOLUTE` / `getAddress`: retorna la misma dirección",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ABSOLUTE` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x1234, 123);
	addressingModes.ABSOLUTE.getValue(cpu, 0x1234).should.equal(123);
})({
	locales: {
		es:
			"`ABSOLUTE` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ZERO_PAGE`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("ZERO_PAGE");
	expect(addressingModes.ZERO_PAGE).to.be.an("object");
	addressingModes.ZERO_PAGE.inputSize.should.equal(1);
})({
	locales: {
		es: "`ZERO_PAGE`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ZERO_PAGE` / `getAddress`: returns the same address", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	addressingModes.ZERO_PAGE.getAddress(cpu, 120).should.equal(120);
})({
	locales: {
		es: "`ZERO_PAGE` / `getAddress`: retorna la misma dirección",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`ZERO_PAGE` / `getValue`: reads from memory the address returned by `getAddress`", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(120, 221);
	addressingModes.ABSOLUTE.getValue(cpu, 120).should.equal(221);
})({
	locales: {
		es:
			"`ZERO_PAGE` / `getValue`: lee de memoria la dirección retornada por `getAddress`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE`: inputSize == 1", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("RELATIVE");
	expect(addressingModes.RELATIVE).to.be.an("object");
	addressingModes.RELATIVE.inputSize.should.equal(1);
})({
	locales: {
		es: "`RELATIVE`: inputSize == 1",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE` / `getAddress`: returns an address based on [PC] + offset", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.pc.setValue(0xfe10);
	addressingModes.RELATIVE.getAddress(cpu, 4).should.equal(0xfe14);
	addressingModes.RELATIVE.getAddress(cpu, byte.toU8(-10)).should.equal(0xfe06);
})({
	locales: {
		es:
			"`RELATIVE` / `getAddress`: retorna una dirección basada en [PC] + desplazamiento",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE` / `getValue`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.RELATIVE.getValue(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`RELATIVE` / `getValue`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE`: cannot cross $FFFF", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.pc.setValue(0xffff);
	addressingModes.RELATIVE.getAddress(cpu, 3).should.equal(2);
})({
	locales: {
		es: "`RELATIVE`: no puede cruzar $FFFF",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE`: adds 2 cycles if it crosses page", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();
	cpu.pc.setValue(0xfafe);

	cpu.extraCycles = 0;
	addressingModes.RELATIVE.getAddress(cpu, 20, true);
	cpu.extraCycles.should.equal(2);

	cpu.extraCycles = 0;
	addressingModes.RELATIVE.getAddress(cpu, 20, false);
	cpu.extraCycles.should.equal(0);
})({
	locales: {
		es: "`RELATIVE`: agrega 2 ciclos si cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`RELATIVE`: doesn't add any cycles if there's no page-cross", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.pc.setValue(0xfe10);
	addressingModes.RELATIVE.getAddress(cpu, 4);
	cpu.extraCycles.should.equal(0);
})({
	locales: {
		es: "`RELATIVE`: no agrega ningún ciclo si no cruza de página",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT`: inputSize == 2", () => {
	const addressingModes = mainModule.default.addressingModes;
	addressingModes.should.include.key("INDIRECT");
	expect(addressingModes.INDIRECT).to.be.an("object");
	addressingModes.INDIRECT.inputSize.should.equal(2);
})({
	locales: {
		es: "`INDIRECT`: inputSize == 2",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT` / `getAddress`: grabs the address from memory", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(130, 0x12);
	cpu.memory.write(131, 0xfe);
	addressingModes.INDIRECT.getAddress(cpu, 130).should.equal(0xfe12);
})({
	locales: {
		es: "`INDIRECT` / `getAddress`: toma la dirección desde la memoria",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT` / `getValue`: unsupported", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	(() => addressingModes.INDIRECT.getValue(cpu, 0)).should.throw(
		"Unsupported."
	);
})({
	locales: {
		es: "`INDIRECT` / `getValue`: no soportado",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`INDIRECT`: emulates the 'page boundary bug'", () => {
	const addressingModes = mainModule.default.addressingModes;
	const cpu = newCPU();

	cpu.memory.write(0x04ff, 0x12);
	cpu.memory.write(0x0400, 0xcd);
	addressingModes.INDIRECT.getAddress(cpu, 0x04ff).should.equal(0xcd12);
})({
	locales: {
		es: "`INDIRECT`: emula el 'page boundary bug'",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});
