const { evaluate, byte } = $;

let mainModule;
let NROM = null;
beforeEach(async () => {
	mainModule = await evaluate();
	try {
		NROM = (await evaluate("/lib/NROM.js")).default;
	} catch {}
});

// [!] Duplicated >>>
const newHeader = (prgPages = 1, chrPages = 1, flags6 = 0, flags7 = 0) => {
	// prettier-ignore
	return [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, flags7, 0, 0, 0, 0, 0, 0, 0, 0];
};

const newRom = (prgBytes = [], header = newHeader()) => {
	const prg = prgBytes;
	const chr = [];
	for (let i = prgBytes.length; i < 16384; i++) prg.push(0);
	for (let i = 0; i < 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return bytes;
};

const newCPU = (prgBytes = []) => {
	const CPU = mainModule.default.CPU;
	const Cartridge = mainModule.default.Cartridge;

	const cartridge = new Cartridge(newRom(prgBytes));

	const areMappersImplemented = GLOBAL_LEVEL_ID >= Book.current.getId("5a.20");
	if (areMappersImplemented && NROM != null) {
		const mapper = new NROM({ cartridge });
		return new CPU(mapper);
	} else {
		return new CPU(cartridge);
	}
};
// [!] Duplicated <<<

// 5a.15 Instructions (5/5): System (interrupts)

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

	cpu.stack.pop().should.equalBin(0b00100000, "pop()");
	cpu.stack.pop16().should.equalHex(0x1234, "pop16()");
	cpu.cycle.should.equalN(15, "cycle");
	cpu.flags.i.should.equalN(true, "i");
	cpu.pc.getValue().should.equalHex(0x3125, "getValue()");
})({
	locales: {
		es: "la CPU puede manejar interrupciones <RESET>",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("the CPU can handle <NMI> interrupts", () => {
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

	cpu.stack.pop().should.equalBin(0b00100100, "pop()");
	cpu.stack.pop16().should.equalHex(0x1234, "pop16()");
	cpu.cycle.should.equalN(15, "cycle");
	cpu.flags.i.should.equalN(true, "i");
	cpu.pc.getValue().should.equalHex(0x3125, "getValue()");
})({
	locales: {
		es: "la CPU puede manejar interrupciones <NMI>",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
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

	cpu.stack.pop().should.equalBin(0b00100000, "pop()");
	cpu.stack.pop16().should.equalHex(0x1234, "pop16()");
	cpu.cycle.should.equalN(15, "cycle");
	cpu.flags.i.should.equalN(true, "i");
	cpu.pc.getValue().should.equalHex(0x3125, "getValue()");
})({
	locales: {
		es: "la CPU puede manejar interrupciones <IRQ>",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
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

	cpu.sp.getValue().should.equalHex(sp, "getValue()");
	cpu.flags.i.should.equalN(true, "i");
	cpu.pc.getValue().should.equalHex(0x1234, "getValue()");
	cpu.cycle.should.equalN(8, "cycle");
})({
	locales: {
		es: "la CPU ignora interrupciones <IRQ> si la bandera ~I~ está encendida",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("`BRK`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("BRK");
	expect(instructions.BRK).to.be.an("object");
	instructions.BRK.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`BRK`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
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

	cpu.stack.pop().should.equalBin(0b00110000, "pop()");
	cpu.stack.pop16().should.equalHex(0x1234, "pop16()");
	cpu.cycle.should.equalN(15, "cycle");
	cpu.flags.i.should.equalN(true, "i");
	cpu.pc.getValue().should.equalHex(0x3125, "getValue()");
})({
	locales: {
		es:
			"`BRK`: produce una interrupción <IRQ> (el bit 4 de las banderas debería estar encendido)",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});

it("`NOP`: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("NOP");
	expect(instructions.NOP).to.be.an("object");
	instructions.NOP.argument.should.equalN("no", "argument");
})({
	locales: {
		es: "`NOP`: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("5a.15"),
});
