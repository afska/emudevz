const { evaluate, byte } = $;

let mainModule, Console;
before(async () => {
	mainModule = await evaluate();
});

const dummyApu = {};
const dummyControllers = [];
const dummyCartridge = {};
const dummyMapper = {
	ppuRead: () => 0,
	ppuWrite: () => {},
};
const noop = () => {};

// 5b.1 New PPU

it("`/code/index.js` exports an object containing the `PPU` class", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("PPU");
	expect(mainModule.default.PPU).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase `PPU`",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

it("receives and saves the `cpu` property", () => {
	const PPU = mainModule.default.PPU;
	const cpu = {};
	const ppu = new PPU(cpu);
	ppu.should.include.key("cpu");
	ppu.cpu.should.equal(cpu);
})({
	locales: {
		es: "recibe y guarda una propiedad `cpu`",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

it("initializates the counters", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.should.include.key("cycle");
	ppu.should.include.key("scanline");
	ppu.should.include.key("frame");

	ppu.cycle.should.equal(0);
	ppu.scanline.should.equal(-1);
	ppu.frame.should.equal(0);
})({
	locales: {
		es: "inicializa los contadores",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

it("has a `step` method that increments the counters", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.should.respondTo("step");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.frame.should.equal(frame);
				ppu.scanline.should.equal(scanline);
				ppu.cycle.should.equal(cycle);
				ppu.step(noop, noop);
			}
		}
	}

	ppu.frame.should.equal(1);
	ppu.scanline.should.equal(-1);
	ppu.cycle.should.equal(0);
})({
	locales: {
		es: "tiene un método `step` que incrementa los contadores",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

// 5b.2 Frame buffer

it("defines a `frameBuffer` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.should.include.key("frameBuffer");
	ppu.frameBuffer.should.be.a("Uint32Array");
	ppu.frameBuffer.length.should.equal(256 * 240);
})({
	locales: {
		es: "define una propiedad `frameBuffer`",
	},
	use: ({ id }, book) => id >= book.getId("5b.2"),
});

it("has a `plot` method that draws into the frame buffer", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.should.respondTo("plot");

	ppu.plot(35, 20, 0xfffafafa);
	ppu.frameBuffer[20 * 256 + 35].should.equalHex(
		0xfffafafa,
		"frameBuffer[5155]"
	);
})({
	locales: {
		es: "tiene un método `plot` que dibuja en el frame buffer",
	},
	use: ({ id }, book) => id >= book.getId("5b.2"),
});

it("calls `onFrame` every time `step(...)` reaches a new frame", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.should.respondTo("step");
	const onFrame = sinon.spy();

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.step(onFrame, noop);
			}
		}
	}

	onFrame.should.have.been.calledOnce;
})({
	locales: {
		es: "llama a `onFrame` cada vez que `step(...)` alcanza un nuevo frame",
	},
	use: ({ id }, book) => id >= book.getId("5b.2"),
});

// 5b.4 PPU Memory

it("includes a `memory` property with a `PPUMemory` instance", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	ppu.should.include.key("memory");
	ppu.memory.should.respondTo("onLoad");
	ppu.memory.should.respondTo("read");
	ppu.memory.should.respondTo("write");
})({
	locales: {
		es: "incluye una propiedad `memory` con una instancia de `PPUMemory`",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("includes a `memory` property with a `PPUMemory` instance", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	ppu.should.include.key("memory");
	ppu.memory.should.respondTo("onLoad");
	ppu.memory.should.respondTo("read");
	ppu.memory.should.respondTo("write");
})({
	locales: {
		es: "incluye una propiedad `memory` con una instancia de `PPUMemory`",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("its `memory` saves devices in `onLoad`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const cartridge = {};
	const mapper = {};
	ppu.memory.onLoad(cartridge, mapper);

	ppu.memory.cartridge.should.equal(cartridge);
	ppu.memory.mapper.should.equal(mapper);
})({
	locales: {
		es: "su `memory` guarda dispositivos en `onLoad`",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("connects the mapper to PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const cartridge = {};
	const random = byte.random();
	const mapper = {
		ppuRead: (address) => address * random,
		ppuWrite: () => {},
	};
	ppu.memory.onLoad(cartridge, mapper);

	for (let i = 0x0000; i <= 0x1fff; i++) {
		ppu.memory.read(i).should.equalHex(i * random, `read(${i})`);
	}
})({
	locales: {
		es: "conecta el mapper con la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("connects the mapper to PPU memory (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const cartridge = {};
	let arg1 = -1,
		arg2 = -1;
	const mapper = {
		ppuRead: () => 0,
		ppuWrite: (a, b) => {
			arg1 = a;
			arg2 = b;
		},
	};
	ppu.memory.onLoad(cartridge, mapper);

	for (let i = 0x0000; i <= 0x1fff; i++) {
		const value = byte.random();
		ppu.memory.write(i, value);
		arg1.should.equalHex(i, "address");
		arg2.should.equalHex(value, "value");
	}
})({
	locales: {
		es: "conecta el mapper con la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

// 5b.6 Video Registers

it("includes a `registers` property with 9 video registers", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	ppu.should.include.key("registers");
	expect(ppu.registers).to.be.an("object");
	ppu.registers.should.respondTo("read");
	ppu.registers.should.respondTo("write");

	[
		"ppuCtrl",
		"ppuMask",
		"ppuStatus",
		"oamAddr",
		"oamData",
		"ppuScroll",
		"ppuAddr",
		"ppuData",
		"oamDma",
	].forEach((name, i) => {
		const register = ppu.registers[name];

		expect(register).to.be.an("object");
		register.should.respondTo("onRead");
		register.should.respondTo("onWrite");

		sinon.spy(register, "onRead");
		sinon.spy(register, "onWrite");
		const address = name === "oamDma" ? 0x4014 : 0x2000 + i;
		ppu.registers.read(address);
		ppu.registers.write(address, 123);
		register.onRead.should.have.been.calledOnce;
		register.onWrite.should.have.been.calledWith(123);
	});
})({
	locales: {
		es: "incluye una propiedad `registers` con 9 registros de video",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("connects the video registers to CPU memory (reads)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const cpuMemory = new CPUMemory();
	const cpu = { memory: cpuMemory };
	const PPU = mainModule.default.PPU;
	const ppu = new PPU(cpu);
	cpuMemory.onLoad(ppu, dummyApu, dummyMapper, dummyControllers);

	[
		"ppuCtrl",
		"ppuMask",
		"ppuStatus",
		"oamAddr",
		"oamData",
		"ppuScroll",
		"ppuAddr",
		"ppuData",
		"oamDma",
	].forEach((name, i) => {
		const register = ppu.registers[name];
		sinon.spy(register, "onRead");
		const address = name === "oamDma" ? 0x4014 : 0x2000 + i;
		cpuMemory.read(address);
		register.onRead.should.have.been.calledOnce;
	});
})({
	locales: {
		es: "conecta los registros de video con la memoria de CPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("connects the video registers to CPU memory (writes)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const cpuMemory = new CPUMemory();
	const cpu = { memory: cpuMemory };
	const PPU = mainModule.default.PPU;
	const ppu = new PPU(cpu);
	cpuMemory.onLoad(ppu, dummyApu, dummyMapper, dummyControllers);

	[
		"ppuCtrl",
		"ppuMask",
		"ppuStatus",
		"oamAddr",
		"oamData",
		"ppuScroll",
		"ppuAddr",
		"ppuData",
		"oamDma",
	].forEach((name, i) => {
		const register = ppu.registers[name];
		sinon.spy(register, "onWrite");
		const address = name === "oamDma" ? 0x4014 : 0x2000 + i;
		cpuMemory.write(address, 123);
		register.onWrite.should.have.been.calledWith(123);
	});
})({
	locales: {
		es: "conecta los registros de video con la memoria de CPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(120);
	ppuCtrl.value.should.equal(120);
	ppuCtrl.onRead().should.equal(0);
})({
	locales: {
		es: "PPUCtrl: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes nameTableId (bits 0-1)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100000);
	ppuCtrl.nameTableId.should.equal(0);
	ppuCtrl.onWrite(0b10100001);
	ppuCtrl.nameTableId.should.equal(1);
	ppuCtrl.onWrite(0b10100010);
	ppuCtrl.nameTableId.should.equal(2);
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.nameTableId.should.equal(3);
})({
	locales: {
		es: "PPUCtrl: escribe nameTableId (bits 0-1)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes vramAddressIncrement32 (bit 2)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.vramAddressIncrement32.should.equal(0);
	ppuCtrl.onWrite(0b10100111);
	ppuCtrl.vramAddressIncrement32.should.equal(1);
})({
	locales: {
		es: "PPUCtrl: escribe vramAddressIncrement32 (bit 2)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes sprite8x8PatternTableId (bit 3)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.sprite8x8PatternTableId.should.equal(0);
	ppuCtrl.onWrite(0b10101111);
	ppuCtrl.sprite8x8PatternTableId.should.equal(1);
})({
	locales: {
		es: "PPUCtrl: escribe vramAddressIncrement32 (bit 3)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes backgroundPatternTableId (bit 4)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.backgroundPatternTableId.should.equal(0);
	ppuCtrl.onWrite(0b10111111);
	ppuCtrl.backgroundPatternTableId.should.equal(1);
})({
	locales: {
		es: "PPUCtrl: escribe backgroundPatternTableId (bit 4)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes spriteSize (bit 5)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10000011);
	ppuCtrl.spriteSize.should.equal(0);
	ppuCtrl.onWrite(0b10111111);
	ppuCtrl.spriteSize.should.equal(1);
})({
	locales: {
		es: "PPUCtrl: escribe spriteSize (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes generateNMIOnVBlank (bit 7)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b00000011);
	ppuCtrl.generateNMIOnVBlank.should.equal(0);
	ppuCtrl.onWrite(0b10111111);
	ppuCtrl.generateNMIOnVBlank.should.equal(1);
})({
	locales: {
		es: "PPUCtrl: escribe generateNMIOnVBlank (bit 7)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: read only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuStatus = ppu.registers.ppuStatus;
	ppuStatus.setValue(123);
	ppuStatus.onRead().should.equal(123);
	ppuStatus.onWrite(456);
	ppuStatus.onRead().should.equal(123);
})({
	locales: {
		es: "PPUStatus: solo lectura",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: reads spriteOverflow (bit 5)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuStatus = ppu.registers.ppuStatus;
	byte.getBit(ppuStatus.onRead(), 5).should.equal(0);
	ppuStatus.spriteOverflow = 1;
	byte.getBit(ppuStatus.onRead(), 5).should.equal(1);
})({
	locales: {
		es: "PPUStatus: lee spriteOverflow (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: reads sprite0Hit (bit 6)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuStatus = ppu.registers.ppuStatus;
	byte.getBit(ppuStatus.onRead(), 6).should.equal(0);
	ppuStatus.sprite0Hit = 1;
	byte.getBit(ppuStatus.onRead(), 6).should.equal(1);
})({
	locales: {
		es: "PPUStatus: lee sprite0Hit (bit 6)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: reads isInVBlankInterval (bit 7)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuStatus = ppu.registers.ppuStatus;
	byte.getBit(ppuStatus.onRead(), 7).should.equal(0);
	ppuStatus.isInVBlankInterval = 1;
	byte.getBit(ppuStatus.onRead(), 7).should.equal(1);
})({
	locales: {
		es: "PPUStatus: lee isInVBlankInterval (bit 7)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

// 5b.7 VBlank detection

it("PPUStatus: resets isInVBlankInterval after reading", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU();

	const ppuStatus = ppu.registers.ppuStatus;
	ppuStatus.isInVBlankInterval = 1;
	byte.getBit(ppuStatus.onRead(), 7).should.equal(1);
	ppuStatus.isInVBlankInterval.should.equal(0);
})({
	locales: {
		es: "PPUStatus: reinicia isInVBlankInterval luego de leer",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("has methods: `_onPreLine`, `_onVisibleLine`, `onVBlankLine`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.should.respondTo("_onPreLine");
	ppu.should.respondTo("_onVisibleLine");
	ppu.should.respondTo("_onVBlankLine");
})({
	locales: {
		es: "tiene métodos `_onPreLine`, `onVisibleLine`, `onVBlankLine`",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("calls `_onPreLine` on scanline -1, with the `onInterrupt` argument", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	sinon.spy(ppu, "_onPreLine");

	const onInterrupt = () => {};

	for (let scanline = -1; scanline < 261; scanline++) {
		for (let cycle = 0; cycle < 341; cycle++) {
			ppu._onPreLine.resetHistory();
			ppu.scanline = scanline;
			ppu.cycle = cycle;

			ppu.step(noop, onInterrupt);

			if (scanline === -1) {
				try {
					ppu._onPreLine.should.have.been.calledWith(onInterrupt);
				} catch (e) {
					throw new Error(
						`_onPreLine should be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			} else {
				try {
					ppu._onPreLine.should.have.not.been.called;
				} catch (e) {
					throw new Error(
						`_onPreLine should NOT be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			}
		}
	}
})({
	locales: {
		es:
			"llama a `_onPreLine` en la scanline -1, con el argumento `onInterrupt`",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("calls `_onVisibleLine` on scanlines ~[0, 240)~, with the `onInterrupt` argument", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	sinon.spy(ppu, "_onVisibleLine");

	const onInterrupt = () => {};

	for (let scanline = -1; scanline < 261; scanline++) {
		for (let cycle = 0; cycle < 341; cycle++) {
			ppu._onVisibleLine.resetHistory();
			ppu.scanline = scanline;
			ppu.cycle = cycle;

			ppu.step(noop, onInterrupt);

			if (scanline >= 0 && scanline < 240) {
				try {
					ppu._onVisibleLine.should.have.been.calledWith(onInterrupt);
				} catch (e) {
					throw new Error(
						`_onVisibleLine should be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			} else {
				try {
					ppu._onVisibleLine.should.have.not.been.called;
				} catch (e) {
					throw new Error(
						`_onVisibleLine should NOT be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			}
		}
	}
})({
	locales: {
		es:
			"llama a `_onVisibleLine` en las scanlines ~[0, 240)~, con el argumento `onInterrupt`",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("calls `_onVBlankLine` on scanline 241, with the `onInterrupt` argument", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	sinon.spy(ppu, "_onVBlankLine");

	const onInterrupt = () => {};

	for (let scanline = -1; scanline < 261; scanline++) {
		for (let cycle = 0; cycle < 341; cycle++) {
			ppu._onVBlankLine.resetHistory();
			ppu.scanline = scanline;
			ppu.cycle = cycle;

			ppu.step(noop, onInterrupt);

			if (scanline === 241) {
				try {
					ppu._onVBlankLine.should.have.been.calledWith(onInterrupt);
				} catch (e) {
					throw new Error(
						`_onVBlankLine should be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			} else {
				try {
					ppu._onVBlankLine.should.have.not.been.called;
				} catch (e) {
					throw new Error(
						`_onVBlankLine should NOT be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			}
		}
	}
})({
	locales: {
		es:
			"llama a `_onVBlankLine` en la scanline 241, con el argumento `onInterrupt`",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("resets `PPUStatus::isInVBlankInterval` on scanline=-1, cycle=1", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equal(0);
		} else {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equal(1);
		}
	}
})({
	locales: {
		es: "reinicia `PPUStatus::isInVBlankInterval` en scanline=-1, cycle=1",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("sets `PPUStatus::isInVBlankInterval` and triggers an NMI on scanline=241, cycle=1", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const onInterrupt = sinon.spy();

	for (let cycle = 0; cycle < 341; cycle++) {
		onInterrupt.resetHistory();
		ppu.scanline = 241;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 0;

		ppu.step(noop, onInterrupt);

		if (cycle === 1) {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equal(1);
			onInterrupt.should.have.been.calledWith({
				id: "NMI",
				vector: 0xfffa,
			});
		} else {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equal(0);
			onInterrupt.should.have.not.been.called;
		}
	}
})({
	locales: {
		es:
			"asigna `PPUStatus::isInVBlankInterval` y dispara una NMI en scanline=241, cycle=1",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});
