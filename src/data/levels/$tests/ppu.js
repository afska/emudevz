const { evaluate, byte } = $;

let mainModule, Console;
before(async () => {
	mainModule = await evaluate();
});

const masterPalette = [
	/* 0x00 */ 0xff757575,
	/* 0x01 */ 0xff8f1b27,
	/* 0x02 */ 0xffab0000,
	/* 0x03 */ 0xff9f0047,
	/* 0x04 */ 0xff77008f,
	/* 0x05 */ 0xff1300ab,
	/* 0x06 */ 0xff0000a7,
	/* 0x07 */ 0xff000b7f,
	/* 0x08 */ 0xff002f43,
	/* 0x09 */ 0xff004700,
	/* 0x0a */ 0xff005100,
	/* 0x0b */ 0xff173f00,
	/* 0x0c */ 0xff5f3f1b,
	/* 0x0d */ 0xff000000,
	/* 0x0e */ 0xff000000,
	/* 0x0f */ 0xff000000,
	/* 0x10 */ 0xffbcbcbc,
	/* 0x11 */ 0xffef7300,
	/* 0x12 */ 0xffef3b23,
	/* 0x13 */ 0xfff30083,
	/* 0x14 */ 0xffbf00bf,
	/* 0x15 */ 0xff5b00e7,
	/* 0x16 */ 0xff002bdb,
	/* 0x17 */ 0xff0f4fcb,
	/* 0x18 */ 0xff00738b,
	/* 0x19 */ 0xff009700,
	/* 0x1a */ 0xff00ab00,
	/* 0x1b */ 0xff3b9300,
	/* 0x1c */ 0xff8b8300,
	/* 0x1d */ 0xff000000,
	/* 0x1e */ 0xff000000,
	/* 0x1f */ 0xff000000,
	/* 0x20 */ 0xffffffff,
	/* 0x21 */ 0xffffbf3f,
	/* 0x22 */ 0xffff975f,
	/* 0x23 */ 0xfffd8ba7,
	/* 0x24 */ 0xffff7bf7,
	/* 0x25 */ 0xffb777ff,
	/* 0x26 */ 0xff6377ff,
	/* 0x27 */ 0xff3b9bff,
	/* 0x28 */ 0xff3fbff3,
	/* 0x29 */ 0xff13d383,
	/* 0x2a */ 0xff4bdf4f,
	/* 0x2b */ 0xff98f858,
	/* 0x2c */ 0xffdbeb00,
	/* 0x2d */ 0xff000000,
	/* 0x2e */ 0xff000000,
	/* 0x2f */ 0xff000000,
	/* 0x30 */ 0xffffffff,
	/* 0x31 */ 0xffffe7ab,
	/* 0x32 */ 0xffffd7c7,
	/* 0x33 */ 0xffffcbd7,
	/* 0x34 */ 0xffffc7ff,
	/* 0x35 */ 0xffdbc7ff,
	/* 0x36 */ 0xffb3bfff,
	/* 0x37 */ 0xffabdbff,
	/* 0x38 */ 0xffa3e7ff,
	/* 0x39 */ 0xffa3ffe3,
	/* 0x3a */ 0xffbff3ab,
	/* 0x3b */ 0xffcfffb3,
	/* 0x3c */ 0xfff3ff9f,
	/* 0x3d */ 0xff000000,
	/* 0x3e */ 0xff000000,
	/* 0x3f */ 0xff000000,
];

const dummyApu = {};
const dummyControllers = [];
const dummyCartridge = {
	header: {
		mirroringId: "VERTICAL",
	},
};
const dummyMapper = {
	cpuRead: () => 0,
	cpuWrite: () => {},
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

	ppu.cycle.should.equalN(0, "cycle");
	ppu.scanline.should.equalN(-1, "scanline");
	ppu.frame.should.equalN(0, "frame");
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
				ppu.frame.should.equalN(frame, "frame");
				ppu.scanline.should.equalN(scanline, "scanline");
				ppu.cycle.should.equalN(cycle, "cycle");
				ppu.step(noop, noop);
			}
		}
	}

	ppu.frame.should.equalN(1, "frame");
	ppu.scanline.should.equalN(-1, "scanline");
	ppu.cycle.should.equalN(0, "cycle");
})({
	locales: {
		es: "tiene un método `step` que incrementa los contadores",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

// 5b.2 Frame buffer

it("has a `frameBuffer` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.should.include.key("frameBuffer");
	ppu.frameBuffer.should.be.a("Uint32Array");
	ppu.frameBuffer.length.should.equalN(256 * 240, "length");
})({
	locales: {
		es: "tiene una propiedad `frameBuffer`",
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
	const ppu = new PPU({});

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
	const ppu = new PPU({});

	ppu.memory.onLoad(dummyCartridge, dummyMapper);

	ppu.memory.cartridge.should.equal(dummyCartridge);
	ppu.memory.mapper.should.equal(dummyMapper);
})({
	locales: {
		es: "su `memory` guarda dispositivos en `onLoad`",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("connects the mapper to PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const random = byte.random();
	const mapper = {
		ppuRead: (address) => address * random,
		ppuWrite: () => {},
	};
	ppu.memory.onLoad(dummyCartridge, mapper);

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
	const ppu = new PPU({});

	let arg1 = -1,
		arg2 = -1;
	const mapper = {
		ppuRead: () => 0,
		ppuWrite: (a, b) => {
			arg1 = a;
			arg2 = b;
		},
	};
	ppu.memory.onLoad(dummyCartridge, mapper);

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
	const ppu = new PPU({});

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
		register.onRead = sinon.spy();
		register.onWrite = sinon.spy();

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
	ppu.memory.onLoad(dummyCartridge, dummyMapper);

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
		register.onRead = sinon.spy();
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
		register.onWrite = sinon.spy();
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
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(byte.random());
	ppuCtrl.onRead().should.equalN(0, "onRead()");
})({
	locales: {
		es: "PPUCtrl: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes `nameTableId` (bits 0-1)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100000);
	ppuCtrl.nameTableId.should.equalN(0, "nameTableId");
	ppuCtrl.onWrite(0b10100001);
	ppuCtrl.nameTableId.should.equalN(1, "nameTableId");
	ppuCtrl.onWrite(0b10100010);
	ppuCtrl.nameTableId.should.equalN(2, "nameTableId");
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.nameTableId.should.equalN(3, "nameTableId");
})({
	locales: {
		es: "PPUCtrl: escribe `nameTableId` (bits 0-1)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6") && id < book.getId("5b.23"),
});

it("PPUCtrl: writes `vramAddressIncrement32` (bit 2)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.vramAddressIncrement32.should.equalN(0, "vramAddressIncrement32");
	ppuCtrl.onWrite(0b10100111);
	ppuCtrl.vramAddressIncrement32.should.equalN(1, "vramAddressIncrement32");
})({
	locales: {
		es: "PPUCtrl: escribe `vramAddressIncrement32` (bit 2)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6") && id < book.getId("5b.23"),
});

it("PPUCtrl: writes `sprite8x8PatternTableId` (bit 3)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.sprite8x8PatternTableId.should.equalN(0, "sprite8x8PatternTableId");
	ppuCtrl.onWrite(0b10101111);
	ppuCtrl.sprite8x8PatternTableId.should.equalN(1, "sprite8x8PatternTableId");
})({
	locales: {
		es: "PPUCtrl: escribe `vramAddressIncrement32` (bit 3)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes `backgroundPatternTableId` (bit 4)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	ppuCtrl.backgroundPatternTableId.should.equalN(0, "backgroundPatternTableId");
	ppuCtrl.onWrite(0b10111111);
	ppuCtrl.backgroundPatternTableId.should.equalN(1, "backgroundPatternTableId");
})({
	locales: {
		es: "PPUCtrl: escribe `backgroundPatternTableId` (bit 4)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes `spriteSize` (bit 5)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10000011);
	ppuCtrl.spriteSize.should.equalN(0, "spriteSize");
	ppuCtrl.onWrite(0b10111111);
	ppuCtrl.spriteSize.should.equalN(1, "spriteSize");
})({
	locales: {
		es: "PPUCtrl: escribe `spriteSize` (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUCtrl: writes `generateNMIOnVBlank` (bit 7)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b00000011);
	ppuCtrl.generateNMIOnVBlank.should.equalN(0, "generateNMIOnVBlank");
	ppuCtrl.onWrite(0b10111111);
	ppuCtrl.generateNMIOnVBlank.should.equalN(1, "generateNMIOnVBlank");
})({
	locales: {
		es: "PPUCtrl: escribe `generateNMIOnVBlank` (bit 7)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: read only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	ppuStatus.setValue(123);
	ppuStatus.onRead().should.equalN(123, "onRead()");
	ppuStatus.onWrite(456);
	ppuStatus.onRead().should.equalN(123, "onRead()");
})({
	locales: {
		es: "PPUStatus: solo lectura",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: reads `spriteOverflow` (bit 5)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	byte.getBit(ppuStatus.onRead(), 5).should.equalN(0, "bit 5");
	ppuStatus.spriteOverflow = 1;
	byte.getBit(ppuStatus.onRead(), 5).should.equalN(1, "bit 5");
})({
	locales: {
		es: "PPUStatus: lee `spriteOverflow` (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: reads `sprite0Hit` (bit 6)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	byte.getBit(ppuStatus.onRead(), 6).should.equalN(0, "bit 6");
	ppuStatus.sprite0Hit = 1;
	byte.getBit(ppuStatus.onRead(), 6).should.equalN(1, "bit 6");
})({
	locales: {
		es: "PPUStatus: lee `sprite0Hit` (bit 6)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("PPUStatus: reads `isInVBlankInterval` (bit 7) (ON by default)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	byte.getBit(ppuStatus.onRead(), 7).should.equalN(1, "bit 7");
	ppuStatus.isInVBlankInterval = 0;
	byte.getBit(ppuStatus.onRead(), 7).should.equalN(0, "bit 7");
	ppuStatus.isInVBlankInterval = 1;
	byte.getBit(ppuStatus.onRead(), 7).should.equalN(1, "bit 7");
})({
	locales: {
		es: "PPUStatus: lee `isInVBlankInterval` (bit 7) (encendido por defecto)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

// 5b.7 VBlank detection

it("PPUStatus: resets `isInVBlankInterval` after reading", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuStatus = ppu.registers.ppuStatus;

	ppuStatus.isInVBlankInterval = 1;
	byte.getBit(ppuStatus.onRead(), 7).should.equalN(1, "bit 7");
	ppuStatus.isInVBlankInterval.should.equalN(0, "isInVBlankInterval");

	ppuStatus.isInVBlankInterval = 0;
	byte.getBit(ppuStatus.onRead(), 7).should.equalN(0, "bit 7");
	ppuStatus.isInVBlankInterval.should.equalN(0, "isInVBlankInterval");
})({
	locales: {
		es: "PPUStatus: reinicia `isInVBlankInterval` luego de leer",
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
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
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
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
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
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
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
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				0,
				"isInVBlankInterval"
			);
		} else {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				1,
				"isInVBlankInterval"
			);
		}
	}
})({
	locales: {
		es: "reinicia `PPUStatus::isInVBlankInterval` en scanline=-1, cycle=1",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("sets `PPUStatus::isInVBlankInterval` and triggers an NMI on scanline=241, cycle=1 when `PPUCtrl::generateNMIOnVBlank` is on,", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	ppu.registers.ppuCtrl.setValue(0b10000000); // (generate NMI on VBlank)
	const onInterrupt = sinon.spy();

	for (let cycle = 0; cycle < 341; cycle++) {
		onInterrupt.resetHistory();
		ppu.scanline = 241;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 0;

		ppu.step(noop, onInterrupt);

		if (cycle === 1) {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				1,
				"isInVBlankInterval"
			);
			onInterrupt.should.have.been.calledWith({
				id: "NMI",
				vector: 0xfffa,
			});
		} else {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				0,
				"isInVBlankInterval"
			);
			onInterrupt.should.have.not.been.called;
		}
	}
})({
	locales: {
		es:
			"asigna `PPUStatus::isInVBlankInterval` y dispara una NMI en scanline=241, cycle=1 cuando `PPUCtrl::generateNMIOnVBlank` está encendido",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("sets `PPUStatus::isInVBlankInterval` and doesn't trigger an NMI on scanline=241, cycle=1 when `PPUCtrl::generateNMIOnVBlank` is off,", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	const onInterrupt = sinon.spy();

	for (let cycle = 0; cycle < 341; cycle++) {
		onInterrupt.resetHistory();
		ppu.scanline = 241;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 0;

		ppu.step(noop, onInterrupt);

		if (cycle === 1) {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				1,
				"isInVBlankInterval"
			);
			onInterrupt.should.have.not.been.called;
		} else {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				0,
				"isInVBlankInterval"
			);
			onInterrupt.should.have.not.been.called;
		}
	}
})({
	locales: {
		es:
			"asigna `PPUStatus::isInVBlankInterval` y no dispara una NMI en scanline=241, cycle=1 cuando `PPUCtrl::generateNMIOnVBlank` está apagado",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

// 5b.8 VRAM bridge

it("its `memory` has a `vram` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.should.include.key("vram");
	ppu.memory.vram.should.be.a("Uint8Array");
	ppu.memory.vram.length.should.equalN(4096, "length");
})({
	locales: {
		es: "su `memory`incluye una propiedad `vram`",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("connects VRAM to PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
		ppu.memory.read(0x2000 + i).should.equalN(value, `read(0x2000 + ${i})`);
	}
})({
	locales: {
		es: "conecta VRAM con la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.20"),
});

it("connects VRAM to PPU memory (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		ppu.memory.vram[i].should.equalN(value, `vram[${i}]`);
	}
})({
	locales: {
		es: "conecta VRAM con la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.20"),
});

it("PPUAddr: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuAddr = ppu.registers.ppuAddr;

	ppuAddr.onWrite(byte.random());
	ppuAddr.onRead().should.equalN(0, "onRead()");
})({
	locales: {
		es: "PPUAddr: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("PPUAddr: initializes two properties, `latch` and `address`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuAddr = ppu.registers.ppuAddr;

	ppuAddr.should.include.key("latch");
	ppuAddr.latch.should.equalN(false, "latch");

	ppuAddr.should.include.key("address");
	ppuAddr.address.should.equalN(0, "address");
})({
	locales: {
		es: "PPUAddr: inicializa dos propiedades, `latch` y `address`",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.23"),
});

it("PPUAddr: writes the MSB first, then the LSB", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuAddr = ppu.registers.ppuAddr;

	ppuAddr.onWrite(0x12);
	ppuAddr.address.should.equalHex(0x1200, "address");
	ppuAddr.latch.should.equalN(true, "latch");

	ppuAddr.onWrite(0x34);
	ppuAddr.address.should.equalHex(0x1234, "address");
	ppuAddr.latch.should.equalN(false, "latch");

	ppuAddr.onWrite(0x56);
	ppuAddr.address.should.equalHex(0x5634, "address");
	ppuAddr.latch.should.equalN(true, "latch");
})({
	locales: {
		es: "PPUAddr: escribe primero el MSB, luego el LSB",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.23"),
});

it("PPUData: writes the value to VRAM using `PPUAddr::address`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0x2023;

	const value = byte.random();
	ppuData.onWrite(value);
	ppu.memory.read(0x2023).should.equalN(value, "read(0x2023)");
})({
	locales: {
		es: "PPUData: escribe el valor en VRAM usando `PPUAddr::address`",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("PPUData: autoincrements the address by 1 (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0x2023;

	ppuData.onWrite(byte.random());
	ppuAddr.address.should.equalHex(0x2024, "address");

	ppuData.onWrite(byte.random());
	ppuAddr.address.should.equalHex(0x2025, "address");
})({
	locales: {
		es: "PPUData: autoincrementa la dirección por 1 (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("PPUData: autoincrements the address by 32 if `PPUCtrl::vramAddressIncrement32` (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuCtrl.vramAddressIncrement32 = 1;
	ppuAddr.address = 0x2023;

	ppuData.onWrite(byte.random());
	ppuAddr.address.should.equalHex(0x2043, "address");

	ppuData.onWrite(byte.random());
	ppuAddr.address.should.equalHex(0x2063, "address");
})({
	locales: {
		es:
			"PPUData: autoincrementa la dirección por 32 si `PPUCtrl::vramAddressIncrement32` (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("PPUData: autoincrements the address without exceeding $FFFF (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0xffff;
	ppuData.onWrite(byte.random());
	ppuAddr.address.should.equalHex(0x0000, "address");

	ppuAddr.address = 0xffff;
	ppuCtrl.vramAddressIncrement32 = 1;
	ppuData.onWrite(byte.random());
	ppuAddr.address.should.equalN(31, "address");
})({
	locales: {
		es:
			"PPUData: autoincrementa la dirección sin excederse de $FFFF (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("PPUStatus: resets `PPUAddr::latch` after reading", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuStatus = ppu.registers.ppuStatus;

	ppuAddr.latch = true;
	ppuStatus.onRead();
	ppuAddr.latch.should.equalN(false, "latch");

	ppuAddr.latch = false;
	ppuStatus.onRead();
	ppuAddr.latch.should.equalN(false, "latch");
})({
	locales: {
		es: "PPUStatus: reinicia `PPUAddr::latch` luego de leer",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.23"),
});

// 5b.9 Backgrounds (1/2): Drawing Name tables

it("has a `backgroundRenderer` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.should.include.key("backgroundRenderer");
	ppu.backgroundRenderer.should.include.key("ppu");
	ppu.backgroundRenderer.ppu.should.equal(ppu);
})({
	locales: {
		es: "tiene una propiedad `backgroundRenderer`",
	},
	use: ({ id }, book) => id >= book.getId("5b.9"),
});

it("BackgroundRenderer: renderScanline() calls `PPU::plot` 256 times", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
	sinon.spy(ppu, "plot");

	ppu.backgroundRenderer.should.respondTo("renderScanline");
	ppu.backgroundRenderer.renderScanline();
	ppu.plot.callCount.should.equalN(256, "plot.callCount");
})({
	locales: {
		es: "BackgroundRenderer: renderScanline() llama a `PPU::plot` 256 veces",
	},
	use: ({ id }, book) => id >= book.getId("5b.9"),
});

it("calls `backgroundRenderer.renderScanline()` on cycle 0 of every visible scanline", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
	sinon.spy(ppu, "plot");
	sinon.spy(ppu.backgroundRenderer, "renderScanline");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.plot.resetHistory();
				ppu.backgroundRenderer.renderScanline.resetHistory();
				ppu.step(noop, noop);

				if (scanline >= 0 && scanline < 240) {
					if (cycle !== 0) {
						ppu.backgroundRenderer.renderScanline.should.not.have.been.called;
						ppu.plot.should.not.have.been.called;
					} else {
						ppu.backgroundRenderer.renderScanline.callCount.should.equalN(
							1,
							"renderScanline.callCount"
						);
					}
				}
			}
		}
	}
})({
	locales: {
		es:
			"llama a `backgroundRenderer.renderScanline()` en el ciclo 0 de cada scanline visible",
	},
	use: ({ id }, book) => id >= book.getId("5b.9"),
});

// 5b.10 Backgrounds (2/2): Using Attribute tables

it("its `memory` has a `paletteRam` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.should.include.key("paletteRam");
	ppu.memory.paletteRam.should.be.a("Uint8Array");
	ppu.memory.paletteRam.length.should.equalN(32, "length");
})({
	locales: {
		es: "su `memory`incluye una propiedad `paletteRam`",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

it("connects Palette RAM to PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	for (let i = 0; i < 32; i++) {
		const address = 0x3f00 + i;
		const value = byte.random();
		if (
			address === 0x3f10 ||
			address === 0x3f14 ||
			address === 0x3f18 ||
			address === 0x3f1c
		)
			continue;

		ppu.memory.paletteRam[i] = value;
		ppu.memory.read(address).should.equalN(value, `read(0x3f00 + ${i})`);
	}
})({
	locales: {
		es: "conecta Palette RAM con la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

it("connects Palette RAM to PPU memory (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	for (let i = 0; i < 32; i++) {
		const address = 0x3f00 + i;
		const value = byte.random();
		if (
			address === 0x3f10 ||
			address === 0x3f14 ||
			address === 0x3f18 ||
			address === 0x3f1c
		)
			continue;

		ppu.memory.write(address, value);
		ppu.memory.paletteRam[i].should.equalN(value, `paletteRam[${i}]`);
	}
})({
	locales: {
		es: "conecta Palette RAM con la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

it("has a `getColor` method that reads color palettes", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.should.respondTo("getColor");

	for (let i = 0; i < 32; i++) {
		ppu.memory.paletteRam[i] = byte.random(63);
		if (i == 16 + 0) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[0];
		if (i == 16 + 4) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[4];
		if (i == 16 + 8) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[8];
		if (i == 16 + 12) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[12];
	}

	for (let paletteId = 0; paletteId < 8; paletteId++) {
		for (let i = 0; i < 4; i++) {
			ppu
				.getColor(paletteId, i)
				.should.equalHex(
					masterPalette[ppu.memory.paletteRam[paletteId * 4 + i]],
					`getColor(${paletteId}, ${i})`
				);
		}
	}
})({
	locales: {
		es: "tiene un método `getColor` que lee paletas de colores",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

// 5b.11 PPUData: Delayed reads

it("PPUData: reads the value at `PPUAddr::address` with delay", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppu.memory.write(0x2023, 0x8d);
	ppuAddr.address = 0x2023;
	ppuData.onRead().should.equalN(0, "first read");

	ppu.memory.write(0x2023, 0x9e);
	ppuAddr.address = 0x2023;
	ppuData.onRead().should.equalHex(0x8d, "second read");

	ppuAddr.address = 0x2023;
	ppuData.onRead().should.equalHex(0x9e, "third read");
})({
	locales: {
		es: "PPUData: lee el valor en `PPUAddr::address` con retraso",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("PPUData: reads from Palette RAM without delay", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppu.memory.write(0x3f10, 123);
	ppuAddr.address = 0x3f10;

	ppuData.onRead().should.equalN(123, "first read");
})({
	locales: {
		es: "PPUData: lee de Palette RAM sin retraso",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("PPUData: autoincrements the address by 1 (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0x2023;

	ppuData.onRead();
	ppuAddr.address.should.equalHex(0x2024, "address");

	ppuData.onRead();
	ppuAddr.address.should.equalHex(0x2025, "address");
})({
	locales: {
		es: "PPUData: autoincrementa la dirección por 1 (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("PPUData: autoincrements the address by 32 if `PPUCtrl::vramAddressIncrement32` (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuCtrl.vramAddressIncrement32 = 1;
	ppuAddr.address = 0x2023;

	ppuData.onRead();
	ppuAddr.address.should.equalHex(0x2043, "address");

	ppuData.onRead();
	ppuAddr.address.should.equalHex(0x2063, "address");
})({
	locales: {
		es:
			"PPUData: autoincrementa la dirección por 32 si `PPUCtrl::vramAddressIncrement32` (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("PPUData: autoincrements the address without exceeding $FFFF (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0xffff;
	ppuData.onRead();
	ppuAddr.address.should.equalHex(0x0000, "address");

	ppuAddr.address = 0xffff;
	ppuCtrl.vramAddressIncrement32 = 1;
	ppuData.onRead();
	ppuAddr.address.should.equalN(31, "address");
})({
	locales: {
		es:
			"PPUData: autoincrementa la dirección sin excederse de $FFFF (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

// 5b.12 OAM bridge

it("its `memory` has a `oamRam` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.should.include.key("oamRam");
	ppu.memory.oamRam.should.be.a("Uint8Array");
	ppu.memory.oamRam.length.should.equalN(256, "length");
})({
	locales: {
		es: "su `memory`incluye una propiedad `oamRam`",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("OAMData: writes the value to OAM RAM using `OAMAddr::value`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const oamAddr = ppu.registers.oamAddr;
	const oamData = ppu.registers.oamData;

	oamAddr.setValue(23);

	const value = byte.random();
	oamData.onWrite(value);
	ppu.memory.oamRam[23].should.equalN(value, "oamRam[23]");
})({
	locales: {
		es: "OAMData: escribe el valor en OAM RAM usando `OAMAddr::value`",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("OAMData: autoincrements the address by 1 (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const oamAddr = ppu.registers.oamAddr;
	const oamData = ppu.registers.oamData;

	oamAddr.setValue(23);

	oamData.onWrite(byte.random());
	oamAddr.value.should.equalN(24, "address");

	oamData.onWrite(byte.random());
	oamAddr.value.should.equalN(25, "address");
})({
	locales: {
		es: "PPUData: autoincrementa la dirección por 1 (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("OAMData: autoincrements the address without exceeding $FF (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const oamAddr = ppu.registers.oamAddr;
	const oamData = ppu.registers.oamData;

	oamAddr.setValue(0xff);

	oamData.onWrite(byte.random());
	oamAddr.value.should.equalN(0, "address");
})({
	locales: {
		es:
			"OAMData: autoincrementa la dirección sin excederse de $FF (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("OAMDMA: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(byte.random());
	ppuCtrl.onRead().should.equalN(0, "onRead()");
})({
	locales: {
		es: "OAMDMA: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("OAMDMA: copies the whole page to OAM and adds 513 cycles", () => {
	const PPU = mainModule.default.PPU;
	const CPUMemory = mainModule.default.CPUMemory;
	const cpuMemory = new CPUMemory();
	const cpu = { memory: cpuMemory, extraCycles: 3 };
	const ppu = new PPU(cpu);

	const oamDma = ppu.registers.oamDma;

	for (let i = 0; i < 256; i++)
		cpuMemory.write(byte.buildU16(0x06, i), 255 - i);

	oamDma.onWrite(0x06);

	for (let i = 0; i < 256; i++) ppu.memory.oamRam[i].should.equal(255 - i);
	cpu.extraCycles.should.equalN(534, "extraCycles");
})({
	locales: {
		es:
			"OAMData: autoincrementa la dirección sin excederse de $FF (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

// 5b.13 Sprites (1/6): OAM

it("has a `spriteRenderer` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.should.include.key("spriteRenderer");
	ppu.spriteRenderer.should.include.key("ppu");
	ppu.spriteRenderer.ppu.should.equal(ppu);
})({
	locales: {
		es: "tiene una propiedad `spriteRenderer`",
	},
	use: ({ id }, book) => id >= book.getId("5b.13"),
});

it("SpriteRenderer: `_createSprite(...)` creates a `Sprite` instance from OAM data (8x8)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	ppu.memory.oamRam[4 * 31 + 0] = 5; // y
	ppu.memory.oamRam[4 * 31 + 1] = 91; // tile
	ppu.memory.oamRam[4 * 31 + 2] = 0b10000010; // attr
	ppu.memory.oamRam[4 * 31 + 3] = 20; // x

	ppu.spriteRenderer.should.respondTo("_createSprite");
	const sprite = ppu.spriteRenderer._createSprite(31);
	expect(sprite).to.exist;
	sprite.id.should.equalN(31, "id");
	sprite.x.should.equalN(20, "x");
	sprite.y.should.equalN(6, "y");
	sprite.is8x16.should.equalN(false, "is8x16");
	sprite.patternTableId.should.equalN(0, "patternTableId");
	sprite.tileId.should.equalN(91, "tileId");
	sprite.attributes.should.equalBin(0b10000010, "attributes");

	sprite.tileIdFor(0).should.equalN(91, "tileIdFor(...)");
	sprite
		.shouldRenderInScanline(2)
		.should.equalN(false, "shouldRenderInScanline(...)");
	sprite
		.shouldRenderInScanline(6)
		.should.equalN(true, "shouldRenderInScanline(...)");
	sprite.diffY(8).should.equalN(2, "diffY(...)");
	sprite.paletteId.should.equalN(6, "paletteId");
	sprite.isInFrontOfBackground.should.equalN(true, "isInFrontOfBackground");
	sprite.flipX.should.equalN(false, "flipX");
	sprite.flipY.should.equalN(true, "flipY");
	sprite.height.should.equalN(8, "height");
})({
	locales: {
		es:
			"SpriteRenderer: `_createSprite(...)` crea una instancia de `Sprite` desde los datos OAM (8x8)",
	},
	use: ({ id }, book) => id >= book.getId("5b.13"),
});

it("SpriteRenderer: `_createSprite(...)` creates a `Sprite` instance from OAM data (8x16)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	ppu.registers.ppuCtrl.setValue(0b00101000);

	ppu.memory.oamRam[4 * 9 + 0] = 129; // y
	ppu.memory.oamRam[4 * 9 + 1] = 77; // tile
	ppu.memory.oamRam[4 * 9 + 2] = 0b01100001; // attr
	ppu.memory.oamRam[4 * 9 + 3] = 29; // x

	ppu.spriteRenderer.should.respondTo("_createSprite");
	const sprite = ppu.spriteRenderer._createSprite(9);
	expect(sprite).to.exist;
	sprite.id.should.equalN(9, "id");
	sprite.x.should.equalN(29, "x");
	sprite.y.should.equalN(130, "y");
	sprite.is8x16.should.equalN(true, "is8x16");
	sprite.patternTableId.should.equalN(1, "patternTableId");
	sprite.tileId.should.equalN(76, "tileId");
	sprite.attributes.should.equalBin(0b01100001, "attributes");

	sprite.tileIdFor(3).should.equalN(76, "tileIdFor(...)");
	sprite.tileIdFor(12).should.equalN(77, "tileIdFor(...)");
	sprite
		.shouldRenderInScanline(6)
		.should.equalN(false, "shouldRenderInScanline(...)");
	sprite
		.shouldRenderInScanline(136)
		.should.equalN(true, "shouldRenderInScanline(...)");
	sprite
		.shouldRenderInScanline(140)
		.should.equalN(true, "shouldRenderInScanline(...)");
	sprite.diffY(141).should.equalN(11, "diffY(...)");
	sprite.paletteId.should.equalN(5, "paletteId");
	sprite.isInFrontOfBackground.should.equalN(false, "isInFrontOfBackground");
	sprite.flipX.should.equalN(true, "flipX");
	sprite.flipY.should.equalN(false, "flipY");
	sprite.height.should.equalN(16, "height");
})({
	locales: {
		es:
			"SpriteRenderer: `_createSprite(...)` crea una instancia de `Sprite` desde los datos OAM (8x16)",
	},
	use: ({ id }, book) => id >= book.getId("5b.13"),
});

// 5b.14 Sprites (2/6): Evaluation

it("SpriteRenderer: `_evaluate()` returns a sprite array", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	ppu.scanline = 46;

	ppu.memory.oamRam[4 * 1 + 0] = 45; // y
	ppu.memory.oamRam[4 * 1 + 1] = 20; // tile
	ppu.memory.oamRam[4 * 1 + 2] = 0b10000010; // attr
	ppu.memory.oamRam[4 * 1 + 3] = 91; // x

	ppu.memory.oamRam[4 * 5 + 0] = 42; // y
	ppu.memory.oamRam[4 * 5 + 1] = 29; // tile
	ppu.memory.oamRam[4 * 5 + 2] = 0b01100001; // attr
	ppu.memory.oamRam[4 * 5 + 3] = 77; // x

	ppu.memory.oamRam[4 * 8 + 0] = 6; // y
	ppu.memory.oamRam[4 * 8 + 1] = 79; // tile
	ppu.memory.oamRam[4 * 8 + 2] = 0b01100001; // attr
	ppu.memory.oamRam[4 * 8 + 3] = 17; // x

	const sprites = ppu.spriteRenderer._evaluate();
	expect(sprites).to.be.an("array");
	sprites.length.should.equalN(2, "length");
	sprites[0].id.should.equalN(5, "sprites[0].id");
	sprites[0].x.should.equalN(77, "sprites[0].x");
	sprites[0].y.should.equalN(43, "sprites[0].y");
	sprites[1].id.should.equalN(1, "sprites[1].id");
	sprites[1].x.should.equalN(91, "sprites[1].x");
	sprites[1].y.should.equalN(46, "sprites[1].y");
	ppu.registers.ppuStatus.spriteOverflow.should.equalN(0, "spriteOverflow");
})({
	locales: {
		es: "SpriteRenderer: `_evaluate()` retorna una lista de sprites",
	},
	use: ({ id }, book) => id >= book.getId("5b.14"),
});

it("SpriteRenderer: `_evaluate()` sets the sprite overflow flag when there are more than 8 candidate sprites", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	ppu.scanline = 45;

	for (let i = 0; i < 9; i++) {
		ppu.memory.oamRam[4 * i + 0] = 40; // y
		ppu.memory.oamRam[4 * i + 1] = 91; // tile
		ppu.memory.oamRam[4 * i + 2] = 0b10000010; // attr
		ppu.memory.oamRam[4 * i + 3] = 20; // x
	}

	const sprites = ppu.spriteRenderer._evaluate();
	expect(sprites).to.be.an("array");
	sprites.length.should.equalN(8, "length");
	sprites[0].id.should.equal(7, "sprites[0].id");
	sprites[7].id.should.equal(0, "sprites[7].id");
	ppu.registers.ppuStatus.spriteOverflow.should.equalN(1, "spriteOverflow");
})({
	locales: {
		es:
			"SpriteRenderer: `_evaluate()` enciende la bandera de sprite overflow cuando hay más de 8 sprites candidatos",
	},
	use: ({ id }, book) => id >= book.getId("5b.14"),
});

it("resets `PPUStatus::spriteOverflow` on scanline=-1, cycle=1", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.spriteOverflow = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			ppu.registers.ppuStatus.spriteOverflow.should.equalN(0, "spriteOverflow");
		} else {
			ppu.registers.ppuStatus.spriteOverflow.should.equalN(1, "spriteOverflow");
		}
	}
})({
	locales: {
		es: "reinicia `PPUStatus::spriteOverflow` en scanline=-1, cycle=1",
	},
	use: ({ id }, book) => id >= book.getId("5b.14"),
});

// 5b.15 Sprites (3/6): Drawing

it("calls `spriteRenderer.renderScanline()` on cycle 0 of every visible scanline", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
	sinon.spy(ppu, "plot");
	sinon.spy(ppu.spriteRenderer, "renderScanline");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.plot.resetHistory();
				ppu.spriteRenderer.renderScanline.resetHistory();
				ppu.step(noop, noop);

				if (scanline >= 0 && scanline < 240) {
					if (cycle !== 0) {
						ppu.spriteRenderer.renderScanline.should.not.have.been.called;
						ppu.plot.should.not.have.been.called;
					} else {
						ppu.spriteRenderer.renderScanline.callCount.should.equalN(
							1,
							"renderScanline.callCount"
						);
					}
				}
			}
		}
	}
})({
	locales: {
		es:
			"llama a `spriteRenderer.renderScanline()` en el ciclo 0 de cada scanline visible",
	},
	use: ({ id }, book) => id >= book.getId("5b.15"),
});

// 5b.18 Sprites (6/6): Sprite-0 hit

it("SpriteRenderer: `_render(...)` sets the sprite-0 hit flag when an opaque pixel from sprite 0 is drawn over an opaque pixel from background", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	// set scanline
	ppu.scanline = 45;

	// mock mapper so it returns CHRs for tile 91
	ppu.memory.mapper.ppuRead = (address) => {
		return address >= 91 * 16 && address < 91 * 16 + 16 ? 0xff : 0;
	};

	// plot background
	for (let x = 0; x < 256; x++) ppu.plotBG(x, ppu.scanline, 0xff000000, 1);

	// sprite 0 (in y=47) => no hit
	ppu.registers.ppuStatus.sprite0Hit = 0;
	ppu.memory.oamRam[4 * 0 + 0] = 47; // y
	ppu.memory.oamRam[4 * 0 + 1] = 91; // tile
	ppu.memory.oamRam[4 * 0 + 2] = 0b10; // attr
	ppu.memory.oamRam[4 * 0 + 3] = 20; // x
	ppu.spriteRenderer._render(ppu.spriteRenderer._evaluate());
	ppu.registers.ppuStatus.sprite0Hit.should.equalN(0, "sprite0Hit");

	// sprite 1 (in y=43) => no hit
	ppu.registers.ppuStatus.sprite0Hit = 0;
	ppu.memory.oamRam[4 * 1 + 0] = 43; // y
	ppu.memory.oamRam[4 * 1 + 1] = 91; // tile
	ppu.memory.oamRam[4 * 1 + 2] = 0b10; // attr
	ppu.memory.oamRam[4 * 1 + 3] = 20; // x
	ppu.spriteRenderer._render(ppu.spriteRenderer._evaluate());
	ppu.registers.ppuStatus.sprite0Hit.should.equalN(0, "sprite0Hit");

	// sprite 0 (in y=43) => hit
	ppu.registers.ppuStatus.sprite0Hit = 0;
	ppu.memory.oamRam[4 * 0 + 0] = 43; // y
	ppu.memory.oamRam[4 * 0 + 1] = 91; // tile
	ppu.memory.oamRam[4 * 0 + 2] = 0b10; // attr
	ppu.memory.oamRam[4 * 0 + 3] = 20; // x
	ppu.spriteRenderer._render(ppu.spriteRenderer._evaluate());
	ppu.registers.ppuStatus.sprite0Hit.should.equalN(1, "sprite0Hit");

	// sprite 0 (in y=43) (wrong tile) => no hit
	ppu.registers.ppuStatus.sprite0Hit = 0;
	ppu.memory.oamRam[4 * 0 + 0] = 43; // y
	ppu.memory.oamRam[4 * 0 + 1] = 92; // tile
	ppu.memory.oamRam[4 * 0 + 2] = 0b10; // attr
	ppu.memory.oamRam[4 * 0 + 3] = 20; // x
	ppu.spriteRenderer._render(ppu.spriteRenderer._evaluate());
	ppu.registers.ppuStatus.sprite0Hit.should.equalN(0, "sprite0Hit");
})({
	locales: {
		es:
			"SpriteRenderer: `_render(...)` enciende la bandera de sprite-0 hit cuando un píxel opaco del sprite 0 es dibujado sobre un píxel opaco del fondo",
	},
	use: ({ id }, book) => id >= book.getId("5b.18"),
});

it("resets `PPUStatus::sprite0Hit` on scanline=-1, cycle=1", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.spriteOverflow = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			ppu.registers.ppuStatus.spriteOverflow.should.equalN(0, "sprite0Hit");
		} else {
			ppu.registers.ppuStatus.spriteOverflow.should.equalN(1, "sprite0Hit");
		}
	}
})({
	locales: {
		es: "reinicia `PPUStatus::sprite0Hit` en scanline=-1, cycle=1",
	},
	use: ({ id }, book) => id >= book.getId("5b.18"),
});

// 5b.19 Mirroring (1/2): Palette RAM

it("mirrors Palette RAM correctly in PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.paletteRam[0] = 1;
	ppu.memory.paletteRam[4] = 2;
	ppu.memory.paletteRam[8] = 3;
	ppu.memory.paletteRam[12] = 4;

	ppu.memory.read(0x3f10).should.equalN(1, "read(0x3f10)");
	ppu.memory.read(0x3f14).should.equalN(2, "read(0x3f14)");
	ppu.memory.read(0x3f18).should.equalN(3, "read(0x3f18)");
	ppu.memory.read(0x3f1c).should.equalN(4, "read(0x3f1c)");
})({
	locales: {
		es: "espeja la Palette RAM correctamente en la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.19"),
});

it("mirrors Palette RAM correctly in PPU memory (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.write(0x3f10, 1);
	ppu.memory.write(0x3f14, 2);
	ppu.memory.write(0x3f18, 3);
	ppu.memory.write(0x3f1c, 4);

	ppu.memory.paletteRam[0].should.equalN(1, "paletteRam[0]");
	ppu.memory.paletteRam[4].should.equalN(2, "paletteRam[4]");
	ppu.memory.paletteRam[8].should.equalN(3, "paletteRam[8]");
	ppu.memory.paletteRam[12].should.equalN(4, "paletteRam[12]");
})({
	locales: {
		es: "espeja la Palette RAM correctamente en la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.19"),
});

// 5b.20 Mirroring (2/2): Name tables

it("can change the name table mirroring", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	ppu.memory.should.respondTo("changeNameTableMirroringTo");

	ppu.memory.changeNameTableMirroringTo("HORIZONTAL");
	ppu.memory.mirroringId.should.equalN("HORIZONTAL", "mirroringId");
	ppu.memory._mirroring.$2000.should.equalHex(0x000, "_mirroring.$2000");
	ppu.memory._mirroring.$2400.should.equalHex(0x000, "_mirroring.$2400");
	ppu.memory._mirroring.$2800.should.equalHex(0x400, "_mirroring.$2800");
	ppu.memory._mirroring.$2C00.should.equalHex(0x400, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("VERTICAL");
	ppu.memory.mirroringId.should.equalN("VERTICAL", "mirroringId");
	ppu.memory._mirroring.$2000.should.equalHex(0x000, "_mirroring.$2000");
	ppu.memory._mirroring.$2400.should.equalHex(0x400, "_mirroring.$2400");
	ppu.memory._mirroring.$2800.should.equalHex(0x000, "_mirroring.$2800");
	ppu.memory._mirroring.$2C00.should.equalHex(0x400, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("ONE_SCREEN_LOWER_BANK");
	ppu.memory.mirroringId.should.equalN("ONE_SCREEN_LOWER_BANK", "mirroringId");
	ppu.memory._mirroring.$2000.should.equalHex(0x000, "_mirroring.$2000");
	ppu.memory._mirroring.$2400.should.equalHex(0x000, "_mirroring.$2400");
	ppu.memory._mirroring.$2800.should.equalHex(0x000, "_mirroring.$2800");
	ppu.memory._mirroring.$2C00.should.equalHex(0x000, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("ONE_SCREEN_UPPER_BANK");
	ppu.memory.mirroringId.should.equalN("ONE_SCREEN_UPPER_BANK", "mirroringId");
	ppu.memory._mirroring.$2000.should.equalHex(0x400, "_mirroring.$2000");
	ppu.memory._mirroring.$2400.should.equalHex(0x400, "_mirroring.$2400");
	ppu.memory._mirroring.$2800.should.equalHex(0x400, "_mirroring.$2800");
	ppu.memory._mirroring.$2C00.should.equalHex(0x400, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("FOUR_SCREEN");
	ppu.memory.mirroringId.should.equalN("FOUR_SCREEN", "mirroringId");
	ppu.memory._mirroring.$2000.should.equalHex(0x000, "_mirroring.$2000");
	ppu.memory._mirroring.$2400.should.equalHex(0x400, "_mirroring.$2400");
	ppu.memory._mirroring.$2800.should.equalHex(0x800, "_mirroring.$2800");
	ppu.memory._mirroring.$2C00.should.equalHex(0xc00, "_mirroring.$2C00");
})({
	locales: {
		es: "puede cambiar el mirroring de name tables",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("ignores name table mirroring changes if the cartridge header sets FOUR_SCREEN mode", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);

	[
		"HORIZONTAL",
		"VERTICAL",
		"SINGLE_SCREEN_LOWER_BANK",
		"SINGLE_SCREEN_UPPER_BANK",
	].forEach((mirroringId) => {
		ppu.memory.changeNameTableMirroringTo(mirroringId);
		ppu.memory.mirroringId.should.equalN("FOUR_SCREEN", "mirroringId");
		ppu.memory._mirroring.$2000.should.equalHex(0x000, "_mirroring.$2000");
		ppu.memory._mirroring.$2400.should.equalHex(0x400, "_mirroring.$2400");
		ppu.memory._mirroring.$2800.should.equalHex(0x800, "_mirroring.$2800");
		ppu.memory._mirroring.$2C00.should.equalHex(0xc00, "_mirroring.$2C00");
	});
})({
	locales: {
		es:
			"ignora cambios de mirroring de name tables si la cabecera del cartucho establece el modo FOUR_SCREEN",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("autosets the mirroring type based on the cartridge header", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory?.onLoad?.({ header: { mirroringId: "VERTICAL" } }, dummyMapper);
	ppu.memory.mirroringId.should.equalN("VERTICAL", "mirroringId");

	ppu.memory?.onLoad?.({ header: { mirroringId: "HORIZONTAL" } }, dummyMapper);
	ppu.memory.mirroringId.should.equalN("HORIZONTAL", "mirroringId");

	ppu.memory?.onLoad?.(
		{ header: { mirroringId: "ONE_SCREEN_LOWER_BANK" } },
		dummyMapper
	);
	ppu.memory.mirroringId.should.equalN("ONE_SCREEN_LOWER_BANK", "mirroringId");

	ppu.memory?.onLoad?.(
		{ header: { mirroringId: "ONE_SCREEN_UPPER_BANK" } },
		dummyMapper
	);
	ppu.memory.mirroringId.should.equalN("ONE_SCREEN_UPPER_BANK", "mirroringId");

	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);
	ppu.memory.mirroringId.should.equalN("FOUR_SCREEN", "mirroringId");
})({
	locales: {
		es: "autoasigna el tipo de mirroring basado en la cabecera del cartucho",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[HORIZONTAL mirroring] connects VRAM to PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "HORIZONTAL" } }, dummyMapper);

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
	}

	// $2000
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2000 + i)
			.should.equalN(ppu.memory.vram[i], `read(0x2000 + ${i})`);
	// $2400
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2400 + i)
			.should.equalN(ppu.memory.vram[i], `read(0x2400 + ${i})`);
	// $2800
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2800 + i)
			.should.equalN(ppu.memory.vram[0x400 + i], `read(0x2800 + ${i})`);
	// $2C00
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2c00 + i)
			.should.equalN(ppu.memory.vram[0x400 + i], `read(0x2C00 + ${i})`);
})({
	locales: {
		es: "[HORIZONTAL mirroring] conecta VRAM con la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[HORIZONTAL mirroring] connects VRAM to PPU memory (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "HORIZONTAL" } }, dummyMapper);

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		ppu.memory.vram[i].should.equalN(value, `vram[${i}]`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2400 + i, value);
		ppu.memory.vram[i].should.equalN(value, `vram[${i}]`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2800 + i, value);
		ppu.memory.vram[0x400 + i].should.equalN(value, `vram[0x400 + ${i}]`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2c00 + i, value);
		ppu.memory.vram[0x400 + i].should.equalN(value, `vram[0x400 + ${i}]`);
	}
})({
	locales: {
		es:
			"[HORIZONTAL mirroring] conecta VRAM con la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[VERTICAL mirroring] connects VRAM to PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "VERTICAL" } }, dummyMapper);

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
	}

	// $2000
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2000 + i)
			.should.equalN(ppu.memory.vram[i], `read(0x2000 + ${i})`);
	// $2400
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2400 + i)
			.should.equalN(ppu.memory.vram[0x400 + i], `read(0x2400 + ${i})`);
	// $2800
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2800 + i)
			.should.equalN(ppu.memory.vram[i], `read(0x2800 + ${i})`);
	// $2C00
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2c00 + i)
			.should.equalN(ppu.memory.vram[0x400 + i], `read(0x2C00 + ${i})`);
})({
	locales: {
		es: "[VERTICAL mirroring] conecta VRAM con la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[VERTICAL mirroring] connects VRAM to PPU memory (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "VERTICAL" } }, dummyMapper);

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		ppu.memory.vram[i].should.equalN(value, `vram[${i}]`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2400 + i, value);
		ppu.memory.vram[0x400 + i].should.equalN(value, `vram[0x400 + ${i}]`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2800 + i, value);
		ppu.memory.vram[i].should.equalN(value, `vram[${i}]`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2c00 + i, value);
		ppu.memory.vram[0x400 + i].should.equalN(value, `vram[0x400 + ${i}]`);
	}
})({
	locales: {
		es: "[VERTICAL mirroring] conecta VRAM con la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

[
	["ONE_SCREEN_LOWER_BANK", 0],
	["ONE_SCREEN_UPPER_BANK", 0x400],
].forEach(([mirroringId, offset]) => {
	it(`[${mirroringId} mirroring] connects VRAM to PPU memory (reads)`, () => {
		const PPU = mainModule.default.PPU;
		const ppu = new PPU({});
		ppu.memory?.onLoad?.({ header: { mirroringId } }, dummyMapper);

		for (let i = 0; i < 4096; i++) {
			const value = byte.random();
			ppu.memory.vram[i] = value;
		}

		// $2000
		for (let i = 0; i < 0x400; i++)
			ppu.memory
				.read(0x2000 + i)
				.should.equalN(ppu.memory.vram[offset + i], `read(0x2000 + ${i})`);
		// $2400
		for (let i = 0; i < 0x400; i++)
			ppu.memory
				.read(0x2400 + i)
				.should.equalN(ppu.memory.vram[offset + i], `read(0x2400 + ${i})`);
		// $2800
		for (let i = 0; i < 0x400; i++)
			ppu.memory
				.read(0x2800 + i)
				.should.equalN(ppu.memory.vram[offset + i], `read(0x2800 + ${i})`);
		// $2C00
		for (let i = 0; i < 0x400; i++)
			ppu.memory
				.read(0x2c00 + i)
				.should.equalN(ppu.memory.vram[offset + i], `read(0x2C00 + ${i})`);
	})({
		locales: {
			es: `[${mirroringId} mirroring] conecta VRAM con la memoria de PPU (lecturas)`,
		},
		use: ({ id }, book) => id >= book.getId("5b.20"),
	});

	it(`[${mirroringId} mirroring] connects VRAM to PPU memory (writes)`, () => {
		const PPU = mainModule.default.PPU;
		const ppu = new PPU({});
		ppu.memory?.onLoad?.({ header: { mirroringId: mirroringId } }, dummyMapper);

		// $2000
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2000 + i, value);
			ppu.memory.vram[offset + i].should.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
		// $2400
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2400 + i, value);
			ppu.memory.vram[offset + i].should.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
		// $2800
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2800 + i, value);
			ppu.memory.vram[offset + i].should.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
		// $2C00
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2c00 + i, value);
			ppu.memory.vram[offset + i].should.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
	})({
		locales: {
			es: `[${mirroringId} mirroring] conecta VRAM con la memoria de PPU (escrituras)`,
		},
		use: ({ id }, book) => id >= book.getId("5b.20"),
	});
});

it("[FOUR_SCREEN mirroring] connects VRAM to PPU memory (reads)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
	}

	// $2000
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2000 + i)
			.should.equalN(ppu.memory.vram[i], `read(0x2000 + ${i})`);
	// $2400
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2400 + i)
			.should.equalN(ppu.memory.vram[0x400 + i], `read(0x2400 + ${i})`);
	// $2800
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2800 + i)
			.should.equalN(ppu.memory.vram[0x800 + i], `read(0x2800 + ${i})`);
	// $2C00
	for (let i = 0; i < 0x400; i++)
		ppu.memory
			.read(0x2c00 + i)
			.should.equalN(ppu.memory.vram[0xc00 + i], `read(0x2C00 + ${i})`);
})({
	locales: {
		es: "[FOUR_SCREEN mirroring] conecta VRAM con la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[FOUR_SCREEN mirroring] connects VRAM to PPU memory (writes)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		ppu.memory.vram[i].should.equalN(value, `vram[${i}]`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2400 + i, value);
		ppu.memory.vram[0x400 + i].should.equalN(value, `vram[0x400 + ${i}]`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2800 + i, value);
		ppu.memory.vram[0x800 + i].should.equalN(value, `vram[0x800 + ${i}]`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2c00 + i, value);
		ppu.memory.vram[0xc00 + i].should.equalN(value, `vram[0xc00 + ${i}]`);
	}
})({
	locales: {
		es:
			"[FOUR_SCREEN mirroring] conecta VRAM con la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

// 5b.22 Masking

it("PPUMask: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(byte.random());
	ppuMask.onRead().should.equalN(0, "onRead()");
})({
	locales: {
		es: "PPUMask: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("PPUMask: writes `showBackgroundInFirst8Pixels` (bit 1)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100001);
	ppuMask.showBackgroundInFirst8Pixels.should.equalN(
		0,
		"showBackgroundInFirst8Pixels"
	);
	ppuMask.onWrite(0b10100111);
	ppuMask.showBackgroundInFirst8Pixels.should.equalN(
		1,
		"showBackgroundInFirst8Pixels"
	);
})({
	locales: {
		es: "PPUMask: escribe `showBackgroundInFirst8Pixels` (bit 1)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("PPUMask: writes `showSpritesInFirst8Pixels` (bit 2)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100011);
	ppuMask.showSpritesInFirst8Pixels.should.equalN(
		0,
		"showSpritesInFirst8Pixels"
	);
	ppuMask.onWrite(0b10100111);
	ppuMask.showSpritesInFirst8Pixels.should.equalN(
		1,
		"showSpritesInFirst8Pixels"
	);
})({
	locales: {
		es: "PPUMask: escribe `showSpritesInFirst8Pixels` (bit 2)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("PPUMask: writes `showBackground` (bit 3)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100011);
	ppuMask.showBackground.should.equalN(0, "showBackground");
	ppuMask.onWrite(0b10101111);
	ppuMask.showBackground.should.equalN(1, "showBackground");
})({
	locales: {
		es: "PPUMask: escribe `showBackground` (bit 3)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("PPUMask: writes `showSprites` (bit 4)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100011);
	ppuMask.showSprites.should.equalN(0, "showSprites");
	ppuMask.onWrite(0b10111111);
	ppuMask.showSprites.should.equalN(1, "showSprites");
})({
	locales: {
		es: "PPUMask: escribe `showSprites` (bit 4)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("PPUMask: has an `isRenderingEnabled` method that returns true if the background or sprites are enabled", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.should.respondTo("isRenderingEnabled");

	ppuMask.onWrite(0b00000000);
	ppuMask.isRenderingEnabled().should.equalN(0, "isRenderingEnabled()");
	ppuMask.onWrite(0b00001000);
	ppuMask.isRenderingEnabled().should.equalN(1, "isRenderingEnabled()");
	ppuMask.onWrite(0b00000000);
	ppuMask.isRenderingEnabled().should.equalN(0, "isRenderingEnabled()");
	ppuMask.onWrite(0b00011000);
	ppuMask.isRenderingEnabled().should.equalN(1, "isRenderingEnabled()");
	ppuMask.onWrite(0b00000000);
	ppuMask.isRenderingEnabled().should.equalN(0, "isRenderingEnabled()");
	ppuMask.onWrite(0b00010000);
	ppuMask.isRenderingEnabled().should.equalN(1, "isRenderingEnabled()");
})({
	locales: {
		es:
			"PPUMask: tiene un método `isRenderingEnabled` que retorna true si el fondo o los sprites están habilitados",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("doesn't reset anything on scanline=-1, cycle=1 if rendering is off", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x00);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 1;
		ppu.registers.ppuStatus.spriteOverflow = 1;
		ppu.registers.ppuStatus.sprite0Hit = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				1,
				"isInVBlankInterval"
			);
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(
				1,
				"spriteOverflow"
			);
			ppu.registers.ppuStatus.isInVBlankInterval.should.equalN(1, "sprite0Hit");
		}
	}
})({
	locales: {
		es:
			"no reinicia nada en scanline=-1, cycle=1 si el renderizado está apagado",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("doesn't call `backgroundRenderer.renderScanline()` if background rendering is disabled", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0b00010000);
	sinon.spy(ppu, "plot");
	sinon.spy(ppu.backgroundRenderer, "renderScanline");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.plot.resetHistory();
				ppu.backgroundRenderer.renderScanline.resetHistory();
				ppu.step(noop, noop);

				if (scanline >= 0 && scanline < 240) {
					if (cycle !== 0) {
						ppu.backgroundRenderer.renderScanline.should.not.have.been.called;
						ppu.plot.should.not.have.been.called;
					} else {
						ppu.backgroundRenderer.renderScanline.should.not.have.been.called;
					}
				}
			}
		}
	}
})({
	locales: {
		es:
			"no lama a `backgroundRenderer.renderScanline()` si el renderizado de fondos está desactivado",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("doesn't call `spriteRenderer.renderScanline()` if sprite rendering is disabled", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0b00001000);
	sinon.spy(ppu, "plot");
	sinon.spy(ppu.spriteRenderer, "renderScanline");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.plot.resetHistory();
				ppu.spriteRenderer.renderScanline.resetHistory();
				ppu.step(noop, noop);

				if (scanline >= 0 && scanline < 240) {
					if (cycle !== 0) {
						ppu.spriteRenderer.renderScanline.should.not.have.been.called;
						ppu.plot.should.not.have.been.called;
					} else {
						ppu.spriteRenderer.renderScanline.should.not.have.been.called;
					}
				}
			}
		}
	}
})({
	locales: {
		es:
			"no llama a `spriteRenderer.renderScanline()` si el renderizado de sprites está desactivado",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});
