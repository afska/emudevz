const { evaluate, byte } = $;

let mainModule, Console;
before(async () => {
	mainModule = await evaluate();
});

const masterPalette = [
	/* 0x00 */ 0xff626262,
	/* 0x01 */ 0xff902001,
	/* 0x02 */ 0xffa00b24,
	/* 0x03 */ 0xff900047,
	/* 0x04 */ 0xff620060,
	/* 0x05 */ 0xff24006a,
	/* 0x06 */ 0xff001160,
	/* 0x07 */ 0xff002747,
	/* 0x08 */ 0xff003c24,
	/* 0x09 */ 0xff004a01,
	/* 0x0a */ 0xff004f00,
	/* 0x0b */ 0xff244700,
	/* 0x0c */ 0xff623600,
	/* 0x0d */ 0xff000000,
	/* 0x0e */ 0xff000000,
	/* 0x0f */ 0xff000000,
	/* 0x10 */ 0xffababab,
	/* 0x11 */ 0xffe1561f,
	/* 0x12 */ 0xffff394d,
	/* 0x13 */ 0xffef237e,
	/* 0x14 */ 0xffb71ba3,
	/* 0x15 */ 0xff6422b4,
	/* 0x16 */ 0xff0e37ac,
	/* 0x17 */ 0xff00558c,
	/* 0x18 */ 0xff00725e,
	/* 0x19 */ 0xff00882d,
	/* 0x1a */ 0xff009007,
	/* 0x1b */ 0xff478900,
	/* 0x1c */ 0xff9d7300,
	/* 0x1d */ 0xff000000,
	/* 0x1e */ 0xff000000,
	/* 0x1f */ 0xff000000,
	/* 0x20 */ 0xffffffff,
	/* 0x21 */ 0xffffac67,
	/* 0x22 */ 0xffff8d95,
	/* 0x23 */ 0xffff75c8,
	/* 0x24 */ 0xffff6af2,
	/* 0x25 */ 0xffc56fff,
	/* 0x26 */ 0xff6a83ff,
	/* 0x27 */ 0xff1fa0e6,
	/* 0x28 */ 0xff00bfb8,
	/* 0x29 */ 0xff01d885,
	/* 0x2a */ 0xff35e35b,
	/* 0x2b */ 0xff88de45,
	/* 0x2c */ 0xffe3ca49,
	/* 0x2d */ 0xff4e4e4e,
	/* 0x2e */ 0xff000000,
	/* 0x2f */ 0xff000000,
	/* 0x30 */ 0xffffffff,
	/* 0x31 */ 0xffffe0bf,
	/* 0x32 */ 0xffffd3d1,
	/* 0x33 */ 0xffffc9e6,
	/* 0x34 */ 0xffffc3f7,
	/* 0x35 */ 0xffeec4ff,
	/* 0x36 */ 0xffc9cbff,
	/* 0x37 */ 0xffa9d7f7,
	/* 0x38 */ 0xff97e3e6,
	/* 0x39 */ 0xff97eed1,
	/* 0x3a */ 0xffa9f3bf,
	/* 0x3b */ 0xffc9f2b5,
	/* 0x3c */ 0xffeeebb5,
	/* 0x3d */ 0xffb8b8b8,
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
	tick: () => {},
};
const noop = () => {};

// 5b.1 New PPU

it("the file `/code/index.js` exports <an object> containing the `PPU` class", () => {
	expect(mainModule.default).to.be.an("object");
	expect(mainModule.default).to.include.key("PPU");
	expect(mainModule.default.PPU).to.be.a.class;
})({
	locales: {
		es:
			"el archivo `/code/index.js` exporta <un objeto> que contiene la clase `PPU`",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

it("receives and saves the `cpu` property", () => {
	const PPU = mainModule.default.PPU;
	const cpu = {};
	const ppu = new PPU(cpu);
	expect(ppu).to.include.key("cpu");
	expect(ppu.cpu).to.equalN(cpu, "cpu");
})({
	locales: {
		es: "recibe y guarda una propiedad `cpu`",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

it("initializes the <counters>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu).to.include.key("cycle");
	expect(ppu).to.include.key("scanline");
	expect(ppu).to.include.key("frame");

	expect(ppu.cycle).to.equalN(0, "cycle");
	expect(ppu.scanline).to.equalN(-1, "scanline");
	expect(ppu.frame).to.equalN(0, "frame");
})({
	locales: {
		es: "inicializa los <contadores>",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

it("`step(...)` increments the <counters>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	expect(ppu).to.respondTo("step");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				expect(ppu.frame).to.equalN(frame, "frame");
				expect(ppu.scanline).to.equalN(scanline, "scanline");
				expect(ppu.cycle).to.equalN(cycle, "cycle");
				ppu.step(noop, noop);
			}
		}
	}

	expect(ppu.frame).to.equalN(1, "frame");
	expect(ppu.scanline).to.equalN(-1, "scanline");
	expect(ppu.cycle).to.equalN(0, "cycle");
})({
	locales: {
		es: "`step(...)` incrementa los <contadores>",
	},
	use: ({ id }, book) => id >= book.getId("5b.1"),
});

// 5b.2 Frame buffer

it("has a `frameBuffer` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu).to.include.key("frameBuffer");
	expect(ppu.frameBuffer).to.be.a("Uint32Array");
	expect(ppu.frameBuffer.length).to.equalN(256 * 240, "length");
})({
	locales: {
		es: "tiene una propiedad `frameBuffer`",
	},
	use: ({ id }, book) => id >= book.getId("5b.2"),
});

it("`plot(...)` <draws> into the frame buffer", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	expect(ppu).to.respondTo("plot");

	ppu.plot(35, 20, 0xfffafafa);
	expect(ppu.frameBuffer[20 * 256 + 35]).to.equalHex(
		0xfffafafa,
		"frameBuffer[5155]"
	);
})({
	locales: {
		es: "`plot(...)` <dibuja> en el frame buffer",
	},
	use: ({ id }, book) => id >= book.getId("5b.2"),
});

it("calls `onFrame(...)` every time `step(...)` reaches a <new frame>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	expect(ppu).to.respondTo("step");
	const onFrame = sinon.spy();

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.step(onFrame, noop);
			}
		}
	}

	expect(onFrame).to.have.been.calledOnce;
})({
	locales: {
		es:
			"llama a `onFrame(...)` cada vez que `step(...)` alcanza un <nuevo frame>",
	},
	use: ({ id }, book) => id >= book.getId("5b.2"),
});

// 5b.4 PPU Memory

it("includes a `memory` property with a `PPUMemory` instance", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu).to.include.key("memory");
	expect(ppu.memory).to.respondTo("onLoad");
	expect(ppu.memory).to.respondTo("read");
	expect(ppu.memory).to.respondTo("write");
})({
	locales: {
		es: "incluye una propiedad `memory` con una instancia de `PPUMemory`",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("`PPUMemory`: saves <devices> in `onLoad`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.onLoad(dummyCartridge, dummyMapper);

	expect(ppu.memory.cartridge).to.equalN(dummyCartridge, "cartridge");
	expect(ppu.memory.mapper).to.equalN(dummyMapper, "mapper");
})({
	locales: {
		es: "`PPUMemory`: guarda <dispositivos> en `onLoad`",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("`PPUMemory`: connects the mapper (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const random = byte.random();
	const mapper = {
		ppuRead: (address) => address * random,
		ppuWrite: () => {},
	};
	ppu.memory.onLoad(dummyCartridge, mapper);

	for (let i = 0x0000; i <= 0x1fff; i++) {
		expect(ppu.memory.read(i)).to.equalHex(i * random, `read(${i})`);
	}
})({
	locales: {
		es: "`PPUMemory`: conecta el mapper (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("`PPUMemory`: connects the mapper (<writes>)", () => {
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
		expect(arg1).to.equalHex(i, "address");
		expect(arg2).to.equalHex(value, "value");
	}
})({
	locales: {
		es: "`PPUMemory`: conecta el mapper (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

// 5b.6 Video Registers

it("includes a `registers` property with 9 video registers", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu).to.include.key("registers");
	expect(ppu.registers).to.be.an("object");
	expect(ppu.registers).to.respondTo("read");
	expect(ppu.registers).to.respondTo("write");

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
		expect(register).to.respondTo("onRead");
		expect(register).to.respondTo("onWrite");
		register.onRead = sinon.spy();
		register.onWrite = sinon.spy();

		const address = name === "oamDma" ? 0x4014 : 0x2000 + i;
		ppu.registers.read(address);
		ppu.registers.write(address, 123);
		expect(register.onRead).to.have.been.calledOnce;
		expect(register.onWrite).to.have.been.calledWith(123);
	});
})({
	locales: {
		es: "incluye una propiedad `registers` con 9 registros de video",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("connects the video registers to CPU memory (<reads>)", () => {
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
		expect(register.onRead).to.have.been.calledOnce;
	});
})({
	locales: {
		es: "conecta los registros de video con la memoria de CPU (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("connects the video registers to CPU memory (<writes>)", () => {
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
		expect(register.onWrite).to.have.been.calledWith(123);
	});
})({
	locales: {
		es: "conecta los registros de video con la memoria de CPU (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUCtrl`: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(byte.random());
	expect(ppuCtrl.onRead()).to.equalN(0, "onRead()");
})({
	locales: {
		es: "`PPUCtrl`: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUCtrl`: writes `nameTableId` (bits ~0-1~)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100000);
	expect(ppuCtrl.nameTableId).to.equalN(0, "nameTableId");
	ppuCtrl.onWrite(0b10100001);
	expect(ppuCtrl.nameTableId).to.equalN(1, "nameTableId");
	ppuCtrl.onWrite(0b10100010);
	expect(ppuCtrl.nameTableId).to.equalN(2, "nameTableId");
	ppuCtrl.onWrite(0b10100011);
	expect(ppuCtrl.nameTableId).to.equalN(3, "nameTableId");
})({
	locales: {
		es: "`PPUCtrl`: escribe `nameTableId` (bits ~0-1~)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6") && id < book.getId("5b.23"),
});

it("`PPUCtrl`: writes `vramAddressIncrement32` (bit 2)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	expect(ppuCtrl.vramAddressIncrement32).to.equalN(0, "vramAddressIncrement32");
	ppuCtrl.onWrite(0b10100111);
	expect(ppuCtrl.vramAddressIncrement32).to.equalN(1, "vramAddressIncrement32");
})({
	locales: {
		es: "`PPUCtrl`: escribe `vramAddressIncrement32` (bit 2)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6") && id < book.getId("5b.23"),
});

it("`PPUCtrl`: writes `sprite8x8PatternTableId` (bit 3)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	expect(ppuCtrl.sprite8x8PatternTableId).to.equalN(
		0,
		"sprite8x8PatternTableId"
	);
	ppuCtrl.onWrite(0b10101111);
	expect(ppuCtrl.sprite8x8PatternTableId).to.equalN(
		1,
		"sprite8x8PatternTableId"
	);
})({
	locales: {
		es: "`PPUCtrl`: escribe `sprite8x8PatternTableId` (bit 3)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUCtrl`: writes `backgroundPatternTableId` (bit 4)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10100011);
	expect(ppuCtrl.backgroundPatternTableId).to.equalN(
		0,
		"backgroundPatternTableId"
	);
	ppuCtrl.onWrite(0b10111111);
	expect(ppuCtrl.backgroundPatternTableId).to.equalN(
		1,
		"backgroundPatternTableId"
	);
})({
	locales: {
		es: "`PPUCtrl`: escribe `backgroundPatternTableId` (bit 4)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUCtrl`: writes `spriteSize` (bit 5)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b10000011);
	expect(ppuCtrl.spriteSize).to.equalN(0, "spriteSize");
	ppuCtrl.onWrite(0b10111111);
	expect(ppuCtrl.spriteSize).to.equalN(1, "spriteSize");
})({
	locales: {
		es: "`PPUCtrl`: escribe `spriteSize` (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUCtrl`: writes `generateNMIOnVBlank` (bit 7)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(0b00000011);
	expect(ppuCtrl.generateNMIOnVBlank).to.equalN(0, "generateNMIOnVBlank");
	ppuCtrl.onWrite(0b10111111);
	expect(ppuCtrl.generateNMIOnVBlank).to.equalN(1, "generateNMIOnVBlank");
})({
	locales: {
		es: "`PPUCtrl`: escribe `generateNMIOnVBlank` (bit 7)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUStatus`: read only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	ppuStatus.setValue(123);
	expect(ppuStatus.onRead()).to.equalN(123, "onRead()");
	ppuStatus.onWrite(456);
	expect(ppuStatus.onRead()).to.equalN(123, "onRead()");
})({
	locales: {
		es: "`PPUStatus`: solo lectura",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUStatus`: reads `spriteOverflow` (bit 5)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	expect(byte.getBit(ppuStatus.onRead(), 5)).to.equalN(0, "bit 5");
	ppuStatus.spriteOverflow = 1;
	expect(byte.getBit(ppuStatus.onRead(), 5)).to.equalN(1, "bit 5");
})({
	locales: {
		es: "`PPUStatus`: lee `spriteOverflow` (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUStatus`: reads `sprite0Hit` (bit 6)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	expect(byte.getBit(ppuStatus.onRead(), 6)).to.equalN(0, "bit 6");
	ppuStatus.sprite0Hit = 1;
	expect(byte.getBit(ppuStatus.onRead(), 6)).to.equalN(1, "bit 6");
})({
	locales: {
		es: "`PPUStatus`: lee `sprite0Hit` (bit 6)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

it("`PPUStatus`: reads `isInVBlankInterval` (bit 7) (<ON by default>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuStatus = ppu.registers.ppuStatus;
	expect(byte.getBit(ppuStatus.onRead(), 7)).to.equalN(1, "bit 7");
	ppuStatus.isInVBlankInterval = 0;
	expect(byte.getBit(ppuStatus.onRead(), 7)).to.equalN(0, "bit 7");
	ppuStatus.isInVBlankInterval = 1;
	expect(byte.getBit(ppuStatus.onRead(), 7)).to.equalN(1, "bit 7");
})({
	locales: {
		es:
			"`PPUStatus`: lee `isInVBlankInterval` (bit 7) (<encendido por defecto>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.6"),
});

// 5b.7 VBlank detection

it("`PPUStatus`: resets `isInVBlankInterval` after reading", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuStatus = ppu.registers.ppuStatus;

	ppuStatus.isInVBlankInterval = 1;
	expect(byte.getBit(ppuStatus.onRead(), 7)).to.equalN(1, "bit 7");
	expect(ppuStatus.isInVBlankInterval).to.equalN(0, "isInVBlankInterval");

	ppuStatus.isInVBlankInterval = 0;
	expect(byte.getBit(ppuStatus.onRead(), 7)).to.equalN(0, "bit 7");
	expect(ppuStatus.isInVBlankInterval).to.equalN(0, "isInVBlankInterval");
})({
	locales: {
		es: "`PPUStatus`: reinicia `isInVBlankInterval` luego de leer",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("has methods: `_onPreLine(...)`, `_onVisibleLine(...)`, `_onVBlankLine(...)`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu).to.respondTo("_onPreLine");
	expect(ppu).to.respondTo("_onVisibleLine");
	expect(ppu).to.respondTo("_onVBlankLine");
})({
	locales: {
		es:
			"tiene métodos `_onPreLine(...)`, `_onVisibleLine(...)`, `_onVBlankLine(...)`",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("calls `_onPreLine(...)` on scanline ~-1~", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
					expect(ppu._onPreLine).to.have.been.called;
				} catch (e) {
					throw new Error(
						`_onPreLine should be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			} else {
				try {
					expect(ppu._onPreLine).to.not.have.been.called;
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
		es: "llama a `_onPreLine(...)` en la scanline ~-1~",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("calls `_onVisibleLine(...)` on scanlines ~[0, 240)~", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
					expect(ppu._onVisibleLine).to.have.been.called;
				} catch (e) {
					throw new Error(
						`_onVisibleLine should be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			} else {
				try {
					expect(ppu._onVisibleLine).to.not.have.been.called;
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
		es: "llama a `_onVisibleLine(...)` en las scanlines ~[0, 240)~",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("calls `_onVBlankLine(...)` on scanline 241, with the `onInterrupt` argument", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
					expect(ppu._onVBlankLine).to.have.been.calledWith(onInterrupt);
				} catch (e) {
					throw new Error(
						`_onVBlankLine should be called on scanline=${scanline}, cycle=${cycle}`
					);
				}
			} else {
				try {
					expect(ppu._onVBlankLine).to.not.have.been.called;
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
			"llama a `_onVBlankLine(...)` en la scanline 241, con el argumento `onInterrupt`",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("resets `PPUStatus::isInVBlankInterval` on ~scanline=-1~, ~cycle=1~", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				0,
				"isInVBlankInterval"
			);
		} else {
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				1,
				"isInVBlankInterval"
			);
		}
	}
})({
	locales: {
		es: "reinicia `PPUStatus::isInVBlankInterval` en ~scanline=-1~, ~cycle=1~",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("sets `PPUStatus::isInVBlankInterval` and triggers an NMI on ~scanline=241~, ~cycle=1~ when `PPUCtrl::generateNMIOnVBlank` is on,", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				1,
				"isInVBlankInterval"
			);
			expect(onInterrupt).to.have.been.calledWith({
				id: "NMI",
				vector: 0xfffa,
			});
		} else {
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				0,
				"isInVBlankInterval"
			);
			expect(onInterrupt).to.not.have.been.called;
		}
	}
})({
	locales: {
		es:
			"enciende `PPUStatus::isInVBlankInterval` y dispara una NMI en ~scanline=241~, ~cycle=1~ cuando `PPUCtrl::generateNMIOnVBlank` está encendido",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

it("sets `PPUStatus::isInVBlankInterval` and doesn't trigger an NMI on ~scanline=241~, ~cycle=1~ when `PPUCtrl::generateNMIOnVBlank` is <off>,", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	const onInterrupt = sinon.spy();

	for (let cycle = 0; cycle < 341; cycle++) {
		onInterrupt.resetHistory();
		ppu.scanline = 241;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.isInVBlankInterval = 0;

		ppu.step(noop, onInterrupt);

		if (cycle === 1) {
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				1,
				"isInVBlankInterval"
			);
			expect(onInterrupt).to.not.have.been.called;
		} else {
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				0,
				"isInVBlankInterval"
			);
			expect(onInterrupt).to.not.have.been.called;
		}
	}
})({
	locales: {
		es:
			"enciende `PPUStatus::isInVBlankInterval` y no dispara una NMI en ~scanline=241~, ~cycle=1~ cuando `PPUCtrl::generateNMIOnVBlank` está <apagado>",
	},
	use: ({ id }, book) => id >= book.getId("5b.7"),
});

// 5b.8 VRAM bridge

it("`PPUMemory`: has a `vram` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu.memory).to.include.key("vram");
	expect(ppu.memory.vram).to.be.a("Uint8Array");
	expect(ppu.memory.vram.length).to.equalN(4096, "length");
})({
	locales: {
		es: "`PPUMemory`: incluye una propiedad `vram`",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("`PPUMemory`: connects VRAM (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
		expect(ppu.memory.read(0x2000 + i)).to.equalN(value, `read(0x2000 + ${i})`);
	}
})({
	locales: {
		es: "`PPUMemory`: conecta VRAM (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.20"),
});

it("`PPUMemory`: connects VRAM to PPU memory (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		expect(ppu.memory.vram[i]).to.equalN(value, `vram[${i}]`);
	}
})({
	locales: {
		es: "`PPUMemory`: conecta VRAM (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.20"),
});

it("`PPUAddr`: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuAddr = ppu.registers.ppuAddr;

	ppuAddr.onWrite(byte.random());
	expect(ppuAddr.onRead()).to.equalN(0, "onRead()");
})({
	locales: {
		es: "`PPUAddr`: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("`PPUAddr`: initializes two properties, `latch` and `address`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuAddr = ppu.registers.ppuAddr;

	expect(ppuAddr).to.include.key("latch");
	expect(ppuAddr.latch).to.equalN(false, "latch");

	expect(ppuAddr).to.include.key("address");
	expect(ppuAddr.address).to.equalN(0, "address");
})({
	locales: {
		es: "`PPUAddr`: inicializa dos propiedades, `latch` y `address`",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.23"),
});

it("`PPUAddr`: writes the MSB first, then the LSB", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	const ppuAddr = ppu.registers.ppuAddr;

	ppuAddr.onWrite(0x12);
	expect(ppuAddr.address).to.equalHex(0x1200, "address");
	expect(ppuAddr.latch).to.equalN(true, "latch");

	ppuAddr.onWrite(0x34);
	expect(ppuAddr.address).to.equalHex(0x1234, "address");
	expect(ppuAddr.latch).to.equalN(false, "latch");

	ppuAddr.onWrite(0x56);
	expect(ppuAddr.address).to.equalHex(0x5634, "address");
	expect(ppuAddr.latch).to.equalN(true, "latch");
})({
	locales: {
		es: "`PPUAddr`: escribe primero el MSB, luego el LSB",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.23"),
});

it("`PPUData`: writes the value to VRAM using `PPUAddr::address`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0x2023;

	const value = byte.random();
	ppuData.onWrite(value);
	expect(ppu.memory.read(0x2023)).to.equalN(value, "read(0x2023)");
})({
	locales: {
		es: "`PPUData`: escribe el valor en VRAM usando `PPUAddr::address`",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("`PPUData`: autoincrements the address by 1 (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0x2023;

	ppuData.onWrite(byte.random());
	expect(ppuAddr.address).to.equalHex(0x2024, "address");

	ppuData.onWrite(byte.random());
	expect(ppuAddr.address).to.equalHex(0x2025, "address");
})({
	locales: {
		es: "`PPUData`: autoincrementa la dirección por 1 (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("`PPUData`: autoincrements the address by 32 if `PPUCtrl::vramAddressIncrement32` (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuCtrl.vramAddressIncrement32 = 1;
	ppuAddr.address = 0x2023;

	ppuData.onWrite(byte.random());
	expect(ppuAddr.address).to.equalHex(0x2043, "address");

	ppuData.onWrite(byte.random());
	expect(ppuAddr.address).to.equalHex(0x2063, "address");
})({
	locales: {
		es:
			"`PPUData`: autoincrementa la dirección por 32 si `PPUCtrl::vramAddressIncrement32` (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("`PPUData`: autoincrements the address without exceeding $FFFF (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0xffff;
	ppuData.onWrite(byte.random());
	expect(ppuAddr.address).to.equalHex(0x0000, "address");

	ppuAddr.address = 0xffff;
	ppuCtrl.vramAddressIncrement32 = 1;
	ppuData.onWrite(byte.random());
	expect(ppuAddr.address).to.equalN(31, "address");
})({
	locales: {
		es:
			"`PPUData`: autoincrementa la dirección sin excederse de $FFFF (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.8"),
});

it("`PPUStatus`: resets `PPUAddr::latch` after reading", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuStatus = ppu.registers.ppuStatus;

	ppuAddr.latch = true;
	ppuStatus.onRead();
	expect(ppuAddr.latch).to.equalN(false, "latch");

	ppuAddr.latch = false;
	ppuStatus.onRead();
	expect(ppuAddr.latch).to.equalN(false, "latch");
})({
	locales: {
		es: "`PPUStatus`: reinicia `PPUAddr::latch` luego de leer",
	},
	use: ({ id }, book) => id >= book.getId("5b.8") && id < book.getId("5b.23"),
});

// 5b.9 Backgrounds (1/2): Drawing Name tables

it("has a `backgroundRenderer` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu).to.include.key("backgroundRenderer");
	expect(ppu.backgroundRenderer).to.include.key("ppu");
	expect(ppu.backgroundRenderer.ppu).to.equalN(ppu, "ppu");
})({
	locales: {
		es: "tiene una propiedad `backgroundRenderer`",
	},
	use: ({ id }, book) => id >= book.getId("5b.9"),
});

it("`BackgroundRenderer`: `renderScanline()` calls `PPU::plot(...)` 256 times", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
	sinon.spy(ppu, "plot");

	expect(ppu.backgroundRenderer).to.respondTo("renderScanline");
	ppu.backgroundRenderer.renderScanline();
	expect(ppu.plot.callCount).to.equalN(256, "plot.callCount");
})({
	locales: {
		es:
			"`BackgroundRenderer`: `renderScanline()` llama a `PPU::plot(...)` 256 veces",
	},
	use: ({ id }, book) => id >= book.getId("5b.9"),
});

it("calls `backgroundRenderer.renderScanline()` on cycle 0 of every <visible scanline>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
						expect(ppu.backgroundRenderer.renderScanline).to.not.have.been
							.called;
						expect(ppu.plot).to.not.have.been.called;
					} else {
						expect(ppu.backgroundRenderer.renderScanline.callCount).to.equalN(
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
			"llama a `backgroundRenderer.renderScanline()` en el ciclo 0 de cada <scanline visible>",
	},
	use: ({ id }, book) => id >= book.getId("5b.9"),
});

// 5b.10 Backgrounds (2/2): Using Attribute tables

it("`PPUMemory`: has a `paletteRam` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu.memory).to.include.key("paletteRam");
	expect(ppu.memory.paletteRam).to.be.a("Uint8Array");
	expect(ppu.memory.paletteRam.length).to.equalN(32, "length");
})({
	locales: {
		es: "`PPUMemory` incluye una propiedad `paletteRam`",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

it("`PPUMemory`: connects Palette RAM (<reads>)", () => {
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
		expect(ppu.memory.read(address)).to.equalN(value, `read(0x3f00 + ${i})`);
	}
})({
	locales: {
		es: "`PPUMemory`: conecta Palette RAM (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

it("`PPUMemory`: connects Palette RAM (<writes>)", () => {
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
		expect(ppu.memory.paletteRam[i]).to.equalN(value, `paletteRam[${i}]`);
	}
})({
	locales: {
		es: "`PPUMemory`: conecta Palette RAM (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

it("`getColor(...)` reads color palettes", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	expect(ppu).to.respondTo("getColor");

	for (let i = 0; i < 32; i++) {
		ppu.memory.paletteRam[i] = byte.random(63);
		if (i == 16 + 0) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[0];
		if (i == 16 + 4) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[4];
		if (i == 16 + 8) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[8];
		if (i == 16 + 12) ppu.memory.paletteRam[i] = ppu.memory.paletteRam[12];
	}

	for (let paletteId = 0; paletteId < 8; paletteId++) {
		for (let i = 0; i < 4; i++) {
			expect(ppu.getColor(paletteId, i)).to.equalHex(
				masterPalette[ppu.memory.paletteRam[paletteId * 4 + i]],
				`getColor(${paletteId}, ${i})`
			);
		}
	}
})({
	locales: {
		es: "`getColor(...)` lee paletas de colores",
	},
	use: ({ id }, book) => id >= book.getId("5b.10"),
});

// 5b.11 PPUData: Delayed reads

it("`PPUData`: reads the value at `PPUAddr::address` <with delay>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppu.memory.write(0x2023, 0x8d);
	ppuAddr.address = 0x2023;
	expect(ppuData.onRead()).to.equalN(0, "first read");

	ppu.memory.write(0x2023, 0x9e);
	ppuAddr.address = 0x2023;
	expect(ppuData.onRead()).to.equalHex(0x8d, "second read");

	ppuAddr.address = 0x2023;
	expect(ppuData.onRead()).to.equalHex(0x9e, "third read");
})({
	locales: {
		es: "`PPUData`: lee el valor en `PPUAddr::address` <con retraso>",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("`PPUData`: reads from Palette RAM <without delay>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppu.memory.write(0x3f10, 123);
	ppuAddr.address = 0x3f10;

	expect(ppuData.onRead()).to.equalN(123, "first read");
})({
	locales: {
		es: "`PPUData`: lee de Palette RAM <sin retraso>",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("`PPUData`: autoincrements the address by 1 (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0x2023;

	ppuData.onRead();
	expect(ppuAddr.address).to.equalHex(0x2024, "address");

	ppuData.onRead();
	expect(ppuAddr.address).to.equalHex(0x2025, "address");
})({
	locales: {
		es: "`PPUData`: autoincrementa la dirección por 1 (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("`PPUData`: autoincrements the address by 32 if `PPUCtrl::vramAddressIncrement32` (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuCtrl.vramAddressIncrement32 = 1;
	ppuAddr.address = 0x2023;

	ppuData.onRead();
	expect(ppuAddr.address).to.equalHex(0x2043, "address");

	ppuData.onRead();
	expect(ppuAddr.address).to.equalHex(0x2063, "address");
})({
	locales: {
		es:
			"`PPUData`: autoincrementa la dirección por 32 si `PPUCtrl::vramAddressIncrement32` (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

it("`PPUData`: autoincrements the address without exceeding $FFFF (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	const ppuCtrl = ppu.registers.ppuCtrl;
	const ppuAddr = ppu.registers.ppuAddr;
	const ppuData = ppu.registers.ppuData;

	ppuAddr.address = 0xffff;
	ppuData.onRead();
	expect(ppuAddr.address).to.equalHex(0x0000, "address");

	ppuAddr.address = 0xffff;
	ppuCtrl.vramAddressIncrement32 = 1;
	ppuData.onRead();
	expect(ppuAddr.address).to.equalN(31, "address");
})({
	locales: {
		es:
			"`PPUData`: autoincrementa la dirección sin excederse de $FFFF (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.11"),
});

// 5b.12 OAM bridge

it("`PPUMemory`: has an `oamRam` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu.memory).to.include.key("oamRam");
	expect(ppu.memory.oamRam).to.be.a("Uint8Array");
	expect(ppu.memory.oamRam.length).to.equalN(256, "length");
})({
	locales: {
		es: "`PPUMemory`: incluye una propiedad `oamRam`",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("`OAMData`: writes the value to OAM RAM using `OAMAddr::value`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const oamAddr = ppu.registers.oamAddr;
	const oamData = ppu.registers.oamData;

	oamAddr.setValue(23);

	const value = byte.random();
	oamData.onWrite(value);
	expect(ppu.memory.oamRam[23]).to.equalN(value, "oamRam[23]");
})({
	locales: {
		es: "`OAMData`: escribe el valor en OAM RAM usando `OAMAddr::value`",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("`OAMData`: autoincrements the address by 1 (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const oamAddr = ppu.registers.oamAddr;
	const oamData = ppu.registers.oamData;

	oamAddr.setValue(23);

	oamData.onWrite(byte.random());
	expect(oamAddr.value).to.equalN(24, "address");

	oamData.onWrite(byte.random());
	expect(oamAddr.value).to.equalN(25, "address");
})({
	locales: {
		es: "`OAMData`: autoincrementa la dirección por 1 (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("`OAMData`: autoincrements the address without exceeding $FF (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const oamAddr = ppu.registers.oamAddr;
	const oamData = ppu.registers.oamData;

	oamAddr.setValue(0xff);

	oamData.onWrite(byte.random());
	expect(oamAddr.value).to.equalN(0, "address");
})({
	locales: {
		es:
			"`OAMData`: autoincrementa la dirección sin excederse de $FF (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("`OAMDMA`: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuCtrl = ppu.registers.ppuCtrl;
	ppuCtrl.onWrite(byte.random());
	expect(ppuCtrl.onRead()).to.equalN(0, "onRead()");
})({
	locales: {
		es: "`OAMDMA`: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

it("`OAMDMA`: copies the whole page to OAM and adds 513 cycles", () => {
	const PPU = mainModule.default.PPU;
	const CPUMemory = mainModule.default.CPUMemory;
	const cpuMemory = new CPUMemory();
	const cpu = { memory: cpuMemory, extraCycles: 3 };
	const ppu = new PPU(cpu);

	const oamDma = ppu.registers.oamDma;

	for (let i = 0; i < 256; i++)
		cpuMemory.write(byte.buildU16(0x06, i), 255 - i);

	oamDma.onWrite(0x06);

	for (let i = 0; i < 256; i++) {
		expect(ppu.memory.oamRam[i]).to.equalN(255 - i, `oamRam[${i}]`);
	}
	expect(cpu.extraCycles).to.equalN(534, "extraCycles");
})({
	locales: {
		es: "`OAMDMA`: copia la página entera a OAM y agrega 513 ciclos",
	},
	use: ({ id }, book) => id >= book.getId("5b.12"),
});

// 5b.13 Sprites (1/6): OAM

it("has a `spriteRenderer` property", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	expect(ppu).to.include.key("spriteRenderer");
	expect(ppu.spriteRenderer).to.include.key("ppu");
	expect(ppu.spriteRenderer.ppu).to.equalN(ppu, "ppu");
})({
	locales: {
		es: "tiene una propiedad `spriteRenderer`",
	},
	use: ({ id }, book) => id >= book.getId("5b.13"),
});

it("`SpriteRenderer`: `_createSprite(...)` creates a `Sprite` instance from OAM data (<8x8>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	ppu.memory.oamRam[4 * 31 + 0] = 5; // y
	ppu.memory.oamRam[4 * 31 + 1] = 91; // tile
	ppu.memory.oamRam[4 * 31 + 2] = 0b10000010; // attr
	ppu.memory.oamRam[4 * 31 + 3] = 20; // x

	expect(ppu.spriteRenderer).to.respondTo("_createSprite");
	const sprite = ppu.spriteRenderer._createSprite(31);
	expect(sprite).to.exist;
	expect(sprite.id).to.equalN(31, "id");
	expect(sprite.x).to.equalN(20, "x");
	expect(sprite.y).to.equalN(6, "y");
	expect(sprite.is8x16).to.equalN(false, "is8x16");
	expect(sprite.patternTableId).to.equalN(0, "patternTableId");
	expect(sprite.tileId).to.equalN(91, "tileId");
	expect(sprite.attributes).to.equalBin(0b10000010, "attributes");

	expect(sprite.tileIdFor(0)).to.equalN(91, "tileIdFor(...)");
	expect(sprite.shouldRenderInScanline(2)).to.equalN(
		false,
		"shouldRenderInScanline(...)"
	);
	expect(sprite.shouldRenderInScanline(6)).to.equalN(
		true,
		"shouldRenderInScanline(...)"
	);
	expect(sprite.diffY(8)).to.equalN(2, "diffY(...)");
	expect(sprite.paletteId).to.equalN(6, "paletteId");
	expect(sprite.isInFrontOfBackground).to.equalN(true, "isInFrontOfBackground");
	expect(sprite.flipX).to.equalN(false, "flipX");
	expect(sprite.flipY).to.equalN(true, "flipY");
	expect(sprite.height).to.equalN(8, "height");
})({
	locales: {
		es:
			"`SpriteRenderer`: `_createSprite(...)` crea una instancia de `Sprite` desde los datos OAM (<8x8>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.13"),
});

it("`SpriteRenderer`: `_createSprite(...)` creates a `Sprite` instance from OAM data (<8x16>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	ppu.registers.ppuCtrl.setValue(0b00101000);

	ppu.memory.oamRam[4 * 9 + 0] = 129; // y
	ppu.memory.oamRam[4 * 9 + 1] = 77; // tile
	ppu.memory.oamRam[4 * 9 + 2] = 0b01100001; // attr
	ppu.memory.oamRam[4 * 9 + 3] = 29; // x

	expect(ppu.spriteRenderer).to.respondTo("_createSprite");
	const sprite = ppu.spriteRenderer._createSprite(9);
	expect(sprite).to.exist;
	expect(sprite.id).to.equalN(9, "id");
	expect(sprite.x).to.equalN(29, "x");
	expect(sprite.y).to.equalN(130, "y");
	expect(sprite.is8x16).to.equalN(true, "is8x16");
	expect(sprite.patternTableId).to.equalN(1, "patternTableId");
	expect(sprite.tileId).to.equalN(76, "tileId");
	expect(sprite.attributes).to.equalBin(0b01100001, "attributes");

	expect(sprite.tileIdFor(3)).to.equalN(76, "tileIdFor(...)");
	expect(sprite.tileIdFor(12)).to.equalN(77, "tileIdFor(...)");
	expect(sprite.shouldRenderInScanline(6)).to.equalN(
		false,
		"shouldRenderInScanline(...)"
	);
	expect(sprite.shouldRenderInScanline(136)).to.equalN(
		true,
		"shouldRenderInScanline(...)"
	);
	expect(sprite.shouldRenderInScanline(140)).to.equalN(
		true,
		"shouldRenderInScanline(...)"
	);
	expect(sprite.diffY(141)).to.equalN(11, "diffY(...)");
	expect(sprite.paletteId).to.equalN(5, "paletteId");
	expect(sprite.isInFrontOfBackground).to.equalN(
		false,
		"isInFrontOfBackground"
	);
	expect(sprite.flipX).to.equalN(true, "flipX");
	expect(sprite.flipY).to.equalN(false, "flipY");
	expect(sprite.height).to.equalN(16, "height");
})({
	locales: {
		es:
			"`SpriteRenderer`: `_createSprite(...)` crea una instancia de `Sprite` desde los datos OAM (<8x16>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.13"),
});

// 5b.14 Sprites (2/6): Evaluation

it("`SpriteRenderer`: `_evaluate()` returns a sprite array", () => {
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
	expect(sprites, "sprites").to.be.an("array");
	expect(sprites.length).to.equalN(2, "length");
	expect(sprites[0].id).to.equalN(5, "sprites[0].id");
	expect(sprites[0].x).to.equalN(77, "sprites[0].x");
	expect(sprites[0].y).to.equalN(43, "sprites[0].y");
	expect(sprites[1].id).to.equalN(1, "sprites[1].id");
	expect(sprites[1].x).to.equalN(91, "sprites[1].x");
	expect(sprites[1].y).to.equalN(46, "sprites[1].y");
	expect(ppu.registers.ppuStatus.spriteOverflow).to.equalN(0, "spriteOverflow");
})({
	locales: {
		es: "`SpriteRenderer`: `_evaluate()` retorna una lista de sprites",
	},
	use: ({ id }, book) => id >= book.getId("5b.14"),
});

it("`SpriteRenderer`: `_evaluate()` sets the sprite overflow flag when there are more than 8 <candidate sprites>", () => {
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
	expect(sprites, "sprites").to.be.an("array");
	expect(sprites.length).to.equalN(8, "length");
	expect(sprites[0].id).to.equalN(7, "sprites[0].id");
	expect(sprites[7].id).to.equalN(0, "sprites[7].id");
	expect(ppu.registers.ppuStatus.spriteOverflow).to.equalN(1, "spriteOverflow");
})({
	locales: {
		es:
			"`SpriteRenderer`: `_evaluate()` enciende la bandera de sprite overflow cuando hay más de 8 <sprites candidatos>",
	},
	use: ({ id }, book) => id >= book.getId("5b.14"),
});

it("resets `PPUStatus::spriteOverflow` on ~scanline=-1~, ~cycle=1~", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.spriteOverflow = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			expect(ppu.registers.ppuStatus.spriteOverflow).to.equalN(
				0,
				"spriteOverflow"
			);
		} else {
			expect(ppu.registers.ppuStatus.spriteOverflow).to.equalN(
				1,
				"spriteOverflow"
			);
		}
	}
})({
	locales: {
		es: "reinicia `PPUStatus::spriteOverflow` en ~scanline=-1~, ~cycle=1~",
	},
	use: ({ id }, book) => id >= book.getId("5b.14"),
});

// 5b.15 Sprites (3/6): Drawing

it("calls `spriteRenderer.renderScanline()` on cycle 0 of every <visible scanline>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
						expect(ppu.spriteRenderer.renderScanline).to.not.have.been.called;
						expect(ppu.plot).to.not.have.been.called;
					} else {
						expect(ppu.spriteRenderer.renderScanline.callCount).to.equalN(
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
			"llama a `spriteRenderer.renderScanline()` en el ciclo 0 de cada <scanline visible>",
	},
	use: ({ id }, book) => id >= book.getId("5b.15"),
});

// 5b.18 Sprites (6/6): Sprite-zero hit

it("`SpriteRenderer`: `_render(...)` sets the sprite-zero hit flag when an <opaque pixel> from sprite 0 is drawn over an <opaque pixel> from background", () => {
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
	expect(ppu.registers.ppuStatus.sprite0Hit).to.equalN(0, "sprite0Hit");

	// sprite 1 (in y=43) => no hit
	ppu.registers.ppuStatus.sprite0Hit = 0;
	ppu.memory.oamRam[4 * 1 + 0] = 43; // y
	ppu.memory.oamRam[4 * 1 + 1] = 91; // tile
	ppu.memory.oamRam[4 * 1 + 2] = 0b10; // attr
	ppu.memory.oamRam[4 * 1 + 3] = 20; // x
	ppu.spriteRenderer._render(ppu.spriteRenderer._evaluate());
	expect(ppu.registers.ppuStatus.sprite0Hit).to.equalN(0, "sprite0Hit");

	// sprite 0 (in y=43) => hit
	ppu.registers.ppuStatus.sprite0Hit = 0;
	ppu.memory.oamRam[4 * 0 + 0] = 43; // y
	ppu.memory.oamRam[4 * 0 + 1] = 91; // tile
	ppu.memory.oamRam[4 * 0 + 2] = 0b10; // attr
	ppu.memory.oamRam[4 * 0 + 3] = 20; // x
	ppu.spriteRenderer._render(ppu.spriteRenderer._evaluate());
	expect(ppu.registers.ppuStatus.sprite0Hit).to.equalN(1, "sprite0Hit");

	// sprite 0 (in y=43) (wrong tile) => no hit
	ppu.registers.ppuStatus.sprite0Hit = 0;
	ppu.memory.oamRam[4 * 0 + 0] = 43; // y
	ppu.memory.oamRam[4 * 0 + 1] = 92; // tile
	ppu.memory.oamRam[4 * 0 + 2] = 0b10; // attr
	ppu.memory.oamRam[4 * 0 + 3] = 20; // x
	ppu.spriteRenderer._render(ppu.spriteRenderer._evaluate());
	expect(ppu.registers.ppuStatus.sprite0Hit).to.equalN(0, "sprite0Hit");
})({
	locales: {
		es:
			"`SpriteRenderer`: `_render(...)` enciende la bandera de sprite-zero hit cuando un <píxel opaco> del sprite 0 es dibujado sobre un <píxel opaco> del fondo",
	},
	use: ({ id }, book) => id >= book.getId("5b.18"),
});

it("resets `PPUStatus::sprite0Hit` on ~scanline=-1~, ~cycle=1~", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);

	for (let cycle = 0; cycle < 341; cycle++) {
		ppu.scanline = -1;
		ppu.cycle = cycle;
		ppu.registers.ppuStatus.spriteOverflow = 1;

		ppu.step(noop, noop);

		if (cycle === 1) {
			expect(ppu.registers.ppuStatus.spriteOverflow).to.equalN(0, "sprite0Hit");
		} else {
			expect(ppu.registers.ppuStatus.spriteOverflow).to.equalN(1, "sprite0Hit");
		}
	}
})({
	locales: {
		es: "reinicia `PPUStatus::sprite0Hit` en ~scanline=-1~, ~cycle=1~",
	},
	use: ({ id }, book) => id >= book.getId("5b.18"),
});

// 5b.19 Mirroring (1/2): Palette RAM

it("`PPUMemory`: mirrors Palette RAM correctly (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.paletteRam[0] = 1;
	ppu.memory.paletteRam[4] = 2;
	ppu.memory.paletteRam[8] = 3;
	ppu.memory.paletteRam[12] = 4;

	expect(ppu.memory.read(0x3f10)).to.equalN(1, "read(0x3f10)");
	expect(ppu.memory.read(0x3f14)).to.equalN(2, "read(0x3f14)");
	expect(ppu.memory.read(0x3f18)).to.equalN(3, "read(0x3f18)");
	expect(ppu.memory.read(0x3f1c)).to.equalN(4, "read(0x3f1c)");
})({
	locales: {
		es: "`PPUMemory`: espeja la Palette RAM correctamente (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.19"),
});

it("`PPUMemory`: mirrors Palette RAM correctly in PPU memory (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory.write(0x3f10, 1);
	ppu.memory.write(0x3f14, 2);
	ppu.memory.write(0x3f18, 3);
	ppu.memory.write(0x3f1c, 4);

	expect(ppu.memory.paletteRam[0]).to.equalN(1, "paletteRam[0]");
	expect(ppu.memory.paletteRam[4]).to.equalN(2, "paletteRam[4]");
	expect(ppu.memory.paletteRam[8]).to.equalN(3, "paletteRam[8]");
	expect(ppu.memory.paletteRam[12]).to.equalN(4, "paletteRam[12]");
})({
	locales: {
		es:
			"`PPUMemory`: espeja la Palette RAM correctamente en la memoria de PPU (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.19"),
});

// 5b.20 Mirroring (2/2): Name tables

it("`PPUMemory`: can change the name table mirroring", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);

	expect(ppu.memory).to.respondTo("changeNameTableMirroringTo");

	ppu.memory.changeNameTableMirroringTo("HORIZONTAL");
	expect(ppu.memory.mirroringId).to.equalN("HORIZONTAL", "mirroringId");
	expect(ppu.memory._mirroring.$2000).to.equalHex(0x000, "_mirroring.$2000");
	expect(ppu.memory._mirroring.$2400).to.equalHex(0x000, "_mirroring.$2400");
	expect(ppu.memory._mirroring.$2800).to.equalHex(0x400, "_mirroring.$2800");
	expect(ppu.memory._mirroring.$2C00).to.equalHex(0x400, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("VERTICAL");
	expect(ppu.memory.mirroringId).to.equalN("VERTICAL", "mirroringId");
	expect(ppu.memory._mirroring.$2000).to.equalHex(0x000, "_mirroring.$2000");
	expect(ppu.memory._mirroring.$2400).to.equalHex(0x400, "_mirroring.$2400");
	expect(ppu.memory._mirroring.$2800).to.equalHex(0x000, "_mirroring.$2800");
	expect(ppu.memory._mirroring.$2C00).to.equalHex(0x400, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("ONE_SCREEN_LOWER_BANK");
	expect(ppu.memory.mirroringId).to.equalN(
		"ONE_SCREEN_LOWER_BANK",
		"mirroringId"
	);
	expect(ppu.memory._mirroring.$2000).to.equalHex(0x000, "_mirroring.$2000");
	expect(ppu.memory._mirroring.$2400).to.equalHex(0x000, "_mirroring.$2400");
	expect(ppu.memory._mirroring.$2800).to.equalHex(0x000, "_mirroring.$2800");
	expect(ppu.memory._mirroring.$2C00).to.equalHex(0x000, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("ONE_SCREEN_UPPER_BANK");
	expect(ppu.memory.mirroringId).to.equalN(
		"ONE_SCREEN_UPPER_BANK",
		"mirroringId"
	);
	expect(ppu.memory._mirroring.$2000).to.equalHex(0x400, "_mirroring.$2000");
	expect(ppu.memory._mirroring.$2400).to.equalHex(0x400, "_mirroring.$2400");
	expect(ppu.memory._mirroring.$2800).to.equalHex(0x400, "_mirroring.$2800");
	expect(ppu.memory._mirroring.$2C00).to.equalHex(0x400, "_mirroring.$2C00");

	ppu.memory.changeNameTableMirroringTo("FOUR_SCREEN");
	expect(ppu.memory.mirroringId).to.equalN("FOUR_SCREEN", "mirroringId");
	expect(ppu.memory._mirroring.$2000).to.equalHex(0x000, "_mirroring.$2000");
	expect(ppu.memory._mirroring.$2400).to.equalHex(0x400, "_mirroring.$2400");
	expect(ppu.memory._mirroring.$2800).to.equalHex(0x800, "_mirroring.$2800");
	expect(ppu.memory._mirroring.$2C00).to.equalHex(0xc00, "_mirroring.$2C00");
})({
	locales: {
		es: "`PPUMemory`: puede cambiar el mirroring de name tables",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it('`PPUMemory`: ignores name table mirroring changes if the cartridge header sets "FOUR_SCREEN" mode', () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);

	[
		"HORIZONTAL",
		"VERTICAL",
		"ONE_SCREEN_LOWER_BANK",
		"ONE_SCREEN_UPPER_BANK",
	].forEach((mirroringId) => {
		ppu.memory.changeNameTableMirroringTo(mirroringId);
		expect(ppu.memory.mirroringId).to.equalN("FOUR_SCREEN", "mirroringId");
		expect(ppu.memory._mirroring.$2000).to.equalHex(0x000, "_mirroring.$2000");
		expect(ppu.memory._mirroring.$2400).to.equalHex(0x400, "_mirroring.$2400");
		expect(ppu.memory._mirroring.$2800).to.equalHex(0x800, "_mirroring.$2800");
		expect(ppu.memory._mirroring.$2C00).to.equalHex(0xc00, "_mirroring.$2C00");
	});
})({
	locales: {
		es:
			'`PPUMemory`: ignora cambios de mirroring de name tables si la cabecera del cartucho establece el modo "FOUR_SCREEN"',
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("`PPUMemory`: autosets the mirroring type based on the cartridge header", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.memory?.onLoad?.({ header: { mirroringId: "VERTICAL" } }, dummyMapper);
	expect(ppu.memory.mirroringId).to.equalN("VERTICAL", "mirroringId");

	ppu.memory?.onLoad?.({ header: { mirroringId: "HORIZONTAL" } }, dummyMapper);
	expect(ppu.memory.mirroringId).to.equalN("HORIZONTAL", "mirroringId");

	ppu.memory?.onLoad?.(
		{ header: { mirroringId: "ONE_SCREEN_LOWER_BANK" } },
		dummyMapper
	);
	expect(ppu.memory.mirroringId).to.equalN(
		"ONE_SCREEN_LOWER_BANK",
		"mirroringId"
	);

	ppu.memory?.onLoad?.(
		{ header: { mirroringId: "ONE_SCREEN_UPPER_BANK" } },
		dummyMapper
	);
	expect(ppu.memory.mirroringId).to.equalN(
		"ONE_SCREEN_UPPER_BANK",
		"mirroringId"
	);

	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);
	expect(ppu.memory.mirroringId).to.equalN("FOUR_SCREEN", "mirroringId");
})({
	locales: {
		es:
			"`PPUMemory`: autoasigna el tipo de mirroring basado en la cabecera del cartucho",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[~HORIZONTAL~ mirroring] connects VRAM to PPU memory (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "HORIZONTAL" } }, dummyMapper);

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
	}

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2000 + i);
		expect(value).to.equalN(ppu.memory.vram[i], `read(0x2000 + ${i})`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2400 + i);
		expect(value).to.equalN(ppu.memory.vram[i], `read(0x2400 + ${i})`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2800 + i);
		expect(value).to.equalN(ppu.memory.vram[0x400 + i], `read(0x2800 + ${i})`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2c00 + i);
		expect(value).to.equalN(ppu.memory.vram[0x400 + i], `read(0x2C00 + ${i})`);
	}
})({
	locales: {
		es:
			"[~HORIZONTAL~ mirroring] conecta VRAM con la memoria de PPU (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[~HORIZONTAL~ mirroring] connects VRAM to PPU memory (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "HORIZONTAL" } }, dummyMapper);

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		expect(ppu.memory.vram[i]).to.equalN(value, `vram[${i}]`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2400 + i, value);
		expect(ppu.memory.vram[i]).to.equalN(value, `vram[${i}]`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2800 + i, value);
		expect(ppu.memory.vram[0x400 + i]).to.equalN(value, `vram[0x400 + ${i}]`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2c00 + i, value);
		expect(ppu.memory.vram[0x400 + i]).to.equalN(value, `vram[0x400 + ${i}]`);
	}
})({
	locales: {
		es:
			"[~HORIZONTAL~ mirroring] conecta VRAM con la memoria de PPU (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[~VERTICAL~ mirroring] connects VRAM to PPU memory (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "VERTICAL" } }, dummyMapper);

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
	}

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2000 + i);
		expect(value).to.equalN(ppu.memory.vram[i], `read(0x2000 + ${i})`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2400 + i);
		expect(value).to.equalN(ppu.memory.vram[0x400 + i], `read(0x2400 + ${i})`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2800 + i);
		expect(value).to.equalN(ppu.memory.vram[i], `read(0x2800 + ${i})`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2c00 + i);
		expect(value).to.equalN(ppu.memory.vram[0x400 + i], `read(0x2C00 + ${i})`);
	}
})({
	locales: {
		es:
			"[~VERTICAL~ mirroring] conecta VRAM con la memoria de PPU (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[~VERTICAL~ mirroring] connects VRAM to PPU memory (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "VERTICAL" } }, dummyMapper);

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		expect(ppu.memory.vram[i]).to.equalN(value, `vram[${i}]`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2400 + i, value);
		expect(ppu.memory.vram[0x400 + i]).to.equalN(value, `vram[0x400 + ${i}]`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2800 + i, value);
		expect(ppu.memory.vram[i]).to.equalN(value, `vram[${i}]`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2c00 + i, value);
		expect(ppu.memory.vram[0x400 + i]).to.equalN(value, `vram[0x400 + ${i}]`);
	}
})({
	locales: {
		es:
			"[~VERTICAL~ mirroring] conecta VRAM con la memoria de PPU (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

[
	["ONE_SCREEN_LOWER_BANK", 0],
	["ONE_SCREEN_UPPER_BANK", 0x400],
].forEach(([mirroringId, offset]) => {
	it(`[~${mirroringId}~ mirroring] connects VRAM to PPU memory (<reads>)`, () => {
		const PPU = mainModule.default.PPU;
		const ppu = new PPU({});
		ppu.memory?.onLoad?.({ header: { mirroringId } }, dummyMapper);

		for (let i = 0; i < 4096; i++) {
			const value = byte.random();
			ppu.memory.vram[i] = value;
		}

		// $2000
		for (let i = 0; i < 0x400; i++) {
			const value = ppu.memory.read(0x2000 + i);
			expect(value).to.equalN(
				ppu.memory.vram[offset + i],
				`read(0x2000 + ${i})`
			);
		}
		// $2400
		for (let i = 0; i < 0x400; i++) {
			const value = ppu.memory.read(0x2400 + i);
			expect(value).to.equalN(
				ppu.memory.vram[offset + i],
				`read(0x2400 + ${i})`
			);
		}
		// $2800
		for (let i = 0; i < 0x400; i++) {
			const value = ppu.memory.read(0x2800 + i);
			expect(value).to.equalN(
				ppu.memory.vram[offset + i],
				`read(0x2800 + ${i})`
			);
		}
		// $2C00
		for (let i = 0; i < 0x400; i++) {
			const value = ppu.memory.read(0x2c00 + i);
			expect(value).to.equalN(
				ppu.memory.vram[offset + i],
				`read(0x2C00 + ${i})`
			);
		}
	})({
		locales: {
			es: `[~${mirroringId}~ mirroring] conecta VRAM con la memoria de PPU (<lecturas>)`,
		},
		use: ({ id }, book) => id >= book.getId("5b.20"),
	});

	it(`[~${mirroringId}~ mirroring] connects VRAM to PPU memory (<writes>)`, () => {
		const PPU = mainModule.default.PPU;
		const ppu = new PPU({});
		ppu.memory?.onLoad?.({ header: { mirroringId: mirroringId } }, dummyMapper);

		// $2000
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2000 + i, value);
			expect(ppu.memory.vram[offset + i]).to.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
		// $2400
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2400 + i, value);
			expect(ppu.memory.vram[offset + i]).to.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
		// $2800
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2800 + i, value);
			expect(ppu.memory.vram[offset + i]).to.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
		// $2C00
		for (let i = 0; i < 0x400; i++) {
			const value = byte.random();
			ppu.memory.write(0x2c00 + i, value);
			expect(ppu.memory.vram[offset + i]).to.equalN(
				value,
				`vram[${offset} + ${i}]`
			);
		}
	})({
		locales: {
			es: `[~${mirroringId}~ mirroring] conecta VRAM con la memoria de PPU (<escrituras>)`,
		},
		use: ({ id }, book) => id >= book.getId("5b.20"),
	});
});

it("[~FOUR_SCREEN~ mirroring] connects VRAM to PPU memory (<reads>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);

	for (let i = 0; i < 4096; i++) {
		const value = byte.random();
		ppu.memory.vram[i] = value;
	}

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2000 + i);
		expect(value).to.equalN(ppu.memory.vram[i], `read(0x2000 + ${i})`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2400 + i);
		expect(value).to.equalN(ppu.memory.vram[0x400 + i], `read(0x2400 + ${i})`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2800 + i);
		expect(value).to.equalN(ppu.memory.vram[0x800 + i], `read(0x2800 + ${i})`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = ppu.memory.read(0x2c00 + i);
		expect(value).to.equalN(ppu.memory.vram[0xc00 + i], `read(0x2C00 + ${i})`);
	}
})({
	locales: {
		es:
			"[~FOUR_SCREEN~ mirroring] conecta VRAM con la memoria de PPU (<lecturas>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

it("[~FOUR_SCREEN~ mirroring] connects VRAM to PPU memory (<writes>)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.({ header: { mirroringId: "FOUR_SCREEN" } }, dummyMapper);

	// $2000
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2000 + i, value);
		expect(ppu.memory.vram[i]).to.equalN(value, `vram[${i}]`);
	}
	// $2400
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2400 + i, value);
		expect(ppu.memory.vram[0x400 + i]).to.equalN(value, `vram[0x400 + ${i}]`);
	}
	// $2800
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2800 + i, value);
		expect(ppu.memory.vram[0x800 + i]).to.equalN(value, `vram[0x800 + ${i}]`);
	}
	// $2C00
	for (let i = 0; i < 0x400; i++) {
		const value = byte.random();
		ppu.memory.write(0x2c00 + i, value);
		expect(ppu.memory.vram[0xc00 + i]).to.equalN(value, `vram[0xc00 + ${i}]`);
	}
})({
	locales: {
		es:
			"[~FOUR_SCREEN~ mirroring] conecta VRAM con la memoria de PPU (<escrituras>)",
	},
	use: ({ id }, book) => id >= book.getId("5b.20"),
});

// 5b.22 Masking

it("`PPUMask`: write only", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(byte.random());
	expect(ppuMask.onRead()).to.equalN(0, "onRead()");
})({
	locales: {
		es: "`PPUMask`: solo escritura",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("`PPUMask`: writes `showBackgroundInFirst8Pixels` (bit 1)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100001);
	expect(ppuMask.showBackgroundInFirst8Pixels).to.equalN(
		0,
		"showBackgroundInFirst8Pixels"
	);
	ppuMask.onWrite(0b10100111);
	expect(ppuMask.showBackgroundInFirst8Pixels).to.equalN(
		1,
		"showBackgroundInFirst8Pixels"
	);
})({
	locales: {
		es: "`PPUMask`: escribe `showBackgroundInFirst8Pixels` (bit 1)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("`PPUMask`: writes `showSpritesInFirst8Pixels` (bit 2)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100011);
	expect(ppuMask.showSpritesInFirst8Pixels).to.equalN(
		0,
		"showSpritesInFirst8Pixels"
	);
	ppuMask.onWrite(0b10100111);
	expect(ppuMask.showSpritesInFirst8Pixels).to.equalN(
		1,
		"showSpritesInFirst8Pixels"
	);
})({
	locales: {
		es: "`PPUMask`: escribe `showSpritesInFirst8Pixels` (bit 2)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("`PPUMask`: writes `showBackground` (bit 3)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100011);
	expect(ppuMask.showBackground).to.equalN(0, "showBackground");
	ppuMask.onWrite(0b10101111);
	expect(ppuMask.showBackground).to.equalN(1, "showBackground");
})({
	locales: {
		es: "`PPUMask`: escribe `showBackground` (bit 3)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("`PPUMask`: writes `showSprites` (bit 4)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b10100011);
	expect(ppuMask.showSprites).to.equalN(0, "showSprites");
	ppuMask.onWrite(0b10111111);
	expect(ppuMask.showSprites).to.equalN(1, "showSprites");
})({
	locales: {
		es: "`PPUMask`: escribe `showSprites` (bit 4)",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("`PPUMask`: has an `isRenderingEnabled` method that returns ~true~ if the background or sprites are <enabled>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	expect(ppuMask).to.respondTo("isRenderingEnabled");

	ppuMask.onWrite(0b00000000);
	expect(ppuMask.isRenderingEnabled()).to.equalN(0, "isRenderingEnabled()");
	ppuMask.onWrite(0b00001000);
	expect(ppuMask.isRenderingEnabled()).to.equalN(1, "isRenderingEnabled()");
	ppuMask.onWrite(0b00000000);
	expect(ppuMask.isRenderingEnabled()).to.equalN(0, "isRenderingEnabled()");
	ppuMask.onWrite(0b00011000);
	expect(ppuMask.isRenderingEnabled()).to.equalN(1, "isRenderingEnabled()");
	ppuMask.onWrite(0b00000000);
	expect(ppuMask.isRenderingEnabled()).to.equalN(0, "isRenderingEnabled()");
	ppuMask.onWrite(0b00010000);
	expect(ppuMask.isRenderingEnabled()).to.equalN(1, "isRenderingEnabled()");
})({
	locales: {
		es:
			"`PPUMask`: tiene un método `isRenderingEnabled` que retorna ~true~ si el fondo o los sprites están <habilitados>",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("doesn't reset anything on ~scanline=-1~, ~cycle=1~ if rendering is <off>", () => {
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
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				1,
				"isInVBlankInterval"
			);
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				1,
				"spriteOverflow"
			);
			expect(ppu.registers.ppuStatus.isInVBlankInterval).to.equalN(
				1,
				"sprite0Hit"
			);
		}
	}
})({
	locales: {
		es:
			"no reinicia nada en ~scanline=-1~, ~cycle=1~ si el renderizado está <apagado>",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("doesn't call `backgroundRenderer.renderScanline()` if background rendering is <disabled>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
						expect(ppu.backgroundRenderer.renderScanline).to.not.have.been
							.called;
						expect(ppu.plot).to.not.have.been.called;
					} else {
						expect(ppu.backgroundRenderer.renderScanline).to.not.have.been
							.called;
					}
				}
			}
		}
	}
})({
	locales: {
		es:
			"no llama a `backgroundRenderer.renderScanline()` si el renderizado de fondos está <desactivado>",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

it("doesn't call `spriteRenderer.renderScanline()` if sprite rendering is <disabled>", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
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
						expect(ppu.spriteRenderer.renderScanline).to.not.have.been.called;
						expect(ppu.plot).to.not.have.been.called;
					} else {
						expect(ppu.spriteRenderer.renderScanline).to.not.have.been.called;
					}
				}
			}
		}
	}
})({
	locales: {
		es:
			"no llama a `spriteRenderer.renderScanline()` si el renderizado de sprites está <desactivado>",
	},
	use: ({ id }, book) => id >= book.getId("5b.22"),
});

// 5b.24 Color emphasis

it("`PPUMask`: writes `grayscale` (bit 0)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b00000110);
	expect(ppuMask.grayscale).to.equalN(0, "grayscale");
	ppuMask.onWrite(0b00000111);
	expect(ppuMask.grayscale).to.equalN(1, "grayscale");
})({
	locales: {
		es: "`PPUMask`: escribe `grayscale` (bit 0)",
	},
	use: ({ id }, book) => id >= book.getId("5b.24"),
});

it("`PPUMask`: writes `emphasizeRed` (bit 5)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b00000110);
	expect(ppuMask.emphasizeRed).to.equalN(0, "emphasizeRed");
	ppuMask.onWrite(0b00100110);
	expect(ppuMask.emphasizeRed).to.equalN(1, "emphasizeRed");
})({
	locales: {
		es: "`PPUMask`: escribe `emphasizeRed` (bit 5)",
	},
	use: ({ id }, book) => id >= book.getId("5b.24"),
});

it("`PPUMask`: writes `emphasizeGreen` (bit 6)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b00000110);
	expect(ppuMask.emphasizeGreen).to.equalN(0, "emphasizeGreen");
	ppuMask.onWrite(0b01000110);
	expect(ppuMask.emphasizeGreen).to.equalN(1, "emphasizeGreen");
})({
	locales: {
		es: "`PPUMask`: escribe `emphasizeGreen` (bit 6)",
	},
	use: ({ id }, book) => id >= book.getId("5b.24"),
});

it("`PPUMask`: writes `emphasizeBlue` (bit 7)", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	const ppuMask = ppu.registers.ppuMask;
	ppuMask.onWrite(0b00000110);
	expect(ppuMask.emphasizeBlue).to.equalN(0, "emphasizeBlue");
	ppuMask.onWrite(0b10000110);
	expect(ppuMask.emphasizeBlue).to.equalN(1, "emphasizeBlue");
})({
	locales: {
		es: "`PPUMask`: escribe `emphasizeBlue` (bit 7)",
	},
	use: ({ id }, book) => id >= book.getId("5b.24"),
});

// 5b.25 Mapper tick

it("`onLoad(...)` saves the `mapper`", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});

	ppu.onLoad(dummyMapper);

	expect(ppu.mapper).to.equalN(dummyMapper, "mapper");
})({
	locales: {
		es: "`onLoad(...)` guarda el `mapper`",
	},
	use: ({ id }, book) => id >= book.getId("5b.25"),
});

it("calls `mapper.tick()` on cycle 260 if ~scanline < 240~", () => {
	const dummyMapper = {
		cpuRead: () => 0,
		cpuWrite: () => {},
		ppuRead: () => 0,
		ppuWrite: () => {},
		tick: () => {},
	};

	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x1e);
	sinon.spy(ppu.mapper, "tick");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.mapper.tick.resetHistory();
				ppu.step(noop, noop);

				if (scanline < 240 && cycle === 260) {
					expect(ppu.mapper.tick.callCount).to.equalN(1, "tick.callCount");
				} else {
					expect(ppu.mapper.tick).to.not.have.been.called;
				}
			}
		}
	}
})({
	locales: {
		es: "llama a `mapper.tick()` en el ciclo 260 si ~scanline < 240~",
	},
	use: ({ id }, book) => id >= book.getId("5b.25"),
});

it("doesn't call `mapper.tick()` if rendering is <disabled>", () => {
	const dummyMapper = {
		cpuRead: () => 0,
		cpuWrite: () => {},
		ppuRead: () => 0,
		ppuWrite: () => {},
		tick: () => {},
	};

	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
	ppu.onLoad?.(dummyMapper);
	ppu.registers?.ppuMask?.onWrite?.(0x00);
	sinon.spy(ppu.mapper, "tick");

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.mapper.tick.resetHistory();
				ppu.step(noop, noop);

				expect(ppu.mapper.tick).to.not.have.been.called;
			}
		}
	}
})({
	locales: {
		es: "no llama a `mapper.tick()` si el renderizado está <apagado>",
	},
	use: ({ id }, book) => id >= book.getId("5b.25"),
});
