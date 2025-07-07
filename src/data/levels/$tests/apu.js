const { evaluate, byte, lodash: _ } = $;

let mainModule, Console;
before(async () => {
	mainModule = await evaluate();
});

const dummyPpu = {};
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

// 5c.1 New APU

it("`/code/index.js` exports an object containing the `APU` class", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("APU");
	expect(mainModule.default.APU).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase `APU`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("receives and saves the `cpu` property", () => {
	const APU = mainModule.default.APU;
	const cpu = {};
	const apu = new APU(cpu);
	apu.should.include.key("cpu");
	apu.cpu.should.equal(cpu);
})({
	locales: {
		es: "recibe y guarda una propiedad `cpu`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("initializates the counters", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.should.include.key("sampleCounter");
	apu.should.include.key("sample");

	apu.sampleCounter.should.equalN(0, "sampleCounter");
	apu.sample.should.equalN(0, "sample");
})({
	locales: {
		es: "inicializa los contadores",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("increments the sample counter on every `step(...)` call", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	apu.should.respondTo("step");

	for (let i = 0; i < 5; i++) {
		apu.step(() => {});
		apu.sampleCounter.should.equalN(i + 1, "sampleCounter");
	}
})({
	locales: {
		es: "incrementa el contador de samples en cada llamada a `step(...)`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

it("generates a new sample for every 20 `step(...)` calls", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});
	apu.should.respondTo("step");
	const onSample = sinon.spy();

	apu.sample = 15;

	for (let i = 0; i < 19; i++) {
		apu.step(onSample);

		apu.sampleCounter.should.equalN(i + 1, "sampleCounter");
		onSample.should.not.have.been.called;
	}

	apu.step(onSample);
	apu.sampleCounter.should.equalN(0, "sampleCounter");
	onSample.should.have.been.calledWith(apu.sample);
})({
	locales: {
		es: "generate un nuevo sample por cada 20 llamadas a `step(...)`",
	},
	use: ({ id }, book) => id >= book.getId("5c.1"),
});

// TODO: IMPLEMENT---v

// 5b.4 Audio Registers

it("includes a `registers` property with 21 audio registers", () => {
	const APU = mainModule.default.APU;
	const apu = new APU({});

	apu.should.include.key("registers");
	expect(apu.registers).to.be.an("object");
	apu.registers.should.respondTo("read");
	apu.registers.should.respondTo("write");

	const checkRegister = (key, address, read = true, write = true) => {
		const register = _.get(apu.registers, key);

		expect(register, `apu.registers.${key}`).to.be.an("object");
		register.should.respondTo("onRead");
		register.should.respondTo("onWrite");
		register.onRead = sinon.spy();
		register.onWrite = sinon.spy();

		apu.registers.read(address);
		apu.registers.write(address, 123);

		if (read) register.onRead.should.have.been.calledOnce;
		else register.onRead.should.have.not.been.called;

		if (write) register.onWrite.should.have.been.calledWith(123);
		else register.onWrite.should.have.not.been.called;
	};

	checkRegister("pulses[0].control", 0x4000);
	checkRegister("pulses[0].sweep", 0x4001);
	checkRegister("pulses[0].timerLow", 0x4002);
	checkRegister("pulses[0].timerHighLCL", 0x4003);
	checkRegister("pulses[1].control", 0x4004);
	checkRegister("pulses[1].sweep", 0x4005);
	checkRegister("pulses[1].timerLow", 0x4006);
	checkRegister("pulses[1].timerHighLCL", 0x4007);
	checkRegister("triangle.linearLCL", 0x4008);
	checkRegister("triangle.timerLow", 0x400a);
	checkRegister("triangle.timerHighLCL", 0x400b);
	checkRegister("noise.control", 0x400c);
	checkRegister("noise.form", 0x400e);
	checkRegister("noise.lcl", 0x400f);
	checkRegister("dmc.control", 0x4010);
	checkRegister("dmc.load", 0x4011);
	checkRegister("dmc.sampleAddress", 0x4012);
	checkRegister("dmc.sampleLength", 0x4013);
	checkRegister("apuStatus", 0x4015, true, false);
	checkRegister("apuControl", 0x4015, false, true);
	checkRegister("apuFrameCounter", 0x4017);
})({
	locales: {
		es: "incluye una propiedad `registers` con 21 registros de audio",
	},
	use: ({ id }, book) => id >= book.getId("5c.4"),
});

// it("connects the video registers to CPU memory (reads)", () => {
// 	const CPUMemory = mainModule.default.CPUMemory;
// 	const cpuMemory = new CPUMemory();
// 	const cpu = { memory: cpuMemory };
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU(cpu);
// 	cpuMemory.onLoad(ppu, dummyApu, dummyMapper, dummyControllers);
// 	ppu.memory.onLoad(dummyCartridge, dummyMapper);

// 	[
// 		"ppuCtrl",
// 		"ppuMask",
// 		"ppuStatus",
// 		"oamAddr",
// 		"oamData",
// 		"ppuScroll",
// 		"ppuAddr",
// 		"ppuData",
// 		"oamDma",
// 	].forEach((name, i) => {
// 		const register = ppu.registers[name];
// 		register.onRead = sinon.spy();
// 		const address = name === "oamDma" ? 0x4014 : 0x2000 + i;
// 		cpuMemory.read(address);
// 		register.onRead.should.have.been.calledOnce;
// 	});
// })({
// 	locales: {
// 		es: "conecta los registros de video con la memoria de CPU (lecturas)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("connects the video registers to CPU memory (writes)", () => {
// 	const CPUMemory = mainModule.default.CPUMemory;
// 	const cpuMemory = new CPUMemory();
// 	const cpu = { memory: cpuMemory };
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU(cpu);
// 	cpuMemory.onLoad(ppu, dummyApu, dummyMapper, dummyControllers);

// 	[
// 		"ppuCtrl",
// 		"ppuMask",
// 		"ppuStatus",
// 		"oamAddr",
// 		"oamData",
// 		"ppuScroll",
// 		"ppuAddr",
// 		"ppuData",
// 		"oamDma",
// 	].forEach((name, i) => {
// 		const register = ppu.registers[name];
// 		register.onWrite = sinon.spy();
// 		const address = name === "oamDma" ? 0x4014 : 0x2000 + i;
// 		cpuMemory.write(address, 123);
// 		register.onWrite.should.have.been.calledWith(123);
// 	});
// })({
// 	locales: {
// 		es: "conecta los registros de video con la memoria de CPU (escrituras)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUCtrl: write only", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuCtrl = ppu.registers.ppuCtrl;
// 	ppuCtrl.onWrite(byte.random());
// 	ppuCtrl.onRead().should.equalN(0, "onRead()");
// })({
// 	locales: {
// 		es: "PPUCtrl: solo escritura",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUCtrl: writes `nameTableId` (bits 0-1)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuCtrl = ppu.registers.ppuCtrl;
// 	ppuCtrl.onWrite(0b10100000);
// 	ppuCtrl.nameTableId.should.equalN(0, "nameTableId");
// 	ppuCtrl.onWrite(0b10100001);
// 	ppuCtrl.nameTableId.should.equalN(1, "nameTableId");
// 	ppuCtrl.onWrite(0b10100010);
// 	ppuCtrl.nameTableId.should.equalN(2, "nameTableId");
// 	ppuCtrl.onWrite(0b10100011);
// 	ppuCtrl.nameTableId.should.equalN(3, "nameTableId");
// })({
// 	locales: {
// 		es: "PPUCtrl: escribe `nameTableId` (bits 0-1)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4") && id < book.getId("5b.23"),
// });

// it("PPUCtrl: writes `vramAddressIncrement32` (bit 2)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuCtrl = ppu.registers.ppuCtrl;
// 	ppuCtrl.onWrite(0b10100011);
// 	ppuCtrl.vramAddressIncrement32.should.equalN(0, "vramAddressIncrement32");
// 	ppuCtrl.onWrite(0b10100111);
// 	ppuCtrl.vramAddressIncrement32.should.equalN(1, "vramAddressIncrement32");
// })({
// 	locales: {
// 		es: "PPUCtrl: escribe `vramAddressIncrement32` (bit 2)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4") && id < book.getId("5b.23"),
// });

// it("PPUCtrl: writes `sprite8x8PatternTableId` (bit 3)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuCtrl = ppu.registers.ppuCtrl;
// 	ppuCtrl.onWrite(0b10100011);
// 	ppuCtrl.sprite8x8PatternTableId.should.equalN(0, "sprite8x8PatternTableId");
// 	ppuCtrl.onWrite(0b10101111);
// 	ppuCtrl.sprite8x8PatternTableId.should.equalN(1, "sprite8x8PatternTableId");
// })({
// 	locales: {
// 		es: "PPUCtrl: escribe `vramAddressIncrement32` (bit 3)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUCtrl: writes `backgroundPatternTableId` (bit 4)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuCtrl = ppu.registers.ppuCtrl;
// 	ppuCtrl.onWrite(0b10100011);
// 	ppuCtrl.backgroundPatternTableId.should.equalN(0, "backgroundPatternTableId");
// 	ppuCtrl.onWrite(0b10111111);
// 	ppuCtrl.backgroundPatternTableId.should.equalN(1, "backgroundPatternTableId");
// })({
// 	locales: {
// 		es: "PPUCtrl: escribe `backgroundPatternTableId` (bit 4)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUCtrl: writes `spriteSize` (bit 5)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuCtrl = ppu.registers.ppuCtrl;
// 	ppuCtrl.onWrite(0b10000011);
// 	ppuCtrl.spriteSize.should.equalN(0, "spriteSize");
// 	ppuCtrl.onWrite(0b10111111);
// 	ppuCtrl.spriteSize.should.equalN(1, "spriteSize");
// })({
// 	locales: {
// 		es: "PPUCtrl: escribe `spriteSize` (bit 5)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUCtrl: writes `generateNMIOnVBlank` (bit 7)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuCtrl = ppu.registers.ppuCtrl;
// 	ppuCtrl.onWrite(0b00000011);
// 	ppuCtrl.generateNMIOnVBlank.should.equalN(0, "generateNMIOnVBlank");
// 	ppuCtrl.onWrite(0b10111111);
// 	ppuCtrl.generateNMIOnVBlank.should.equalN(1, "generateNMIOnVBlank");
// })({
// 	locales: {
// 		es: "PPUCtrl: escribe `generateNMIOnVBlank` (bit 7)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUStatus: read only", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuStatus = ppu.registers.ppuStatus;
// 	ppuStatus.setValue(123);
// 	ppuStatus.onRead().should.equalN(123, "onRead()");
// 	ppuStatus.onWrite(456);
// 	ppuStatus.onRead().should.equalN(123, "onRead()");
// })({
// 	locales: {
// 		es: "PPUStatus: solo lectura",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUStatus: reads `spriteOverflow` (bit 5)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuStatus = ppu.registers.ppuStatus;
// 	byte.getBit(ppuStatus.onRead(), 5).should.equalN(0, "bit 5");
// 	ppuStatus.spriteOverflow = 1;
// 	byte.getBit(ppuStatus.onRead(), 5).should.equalN(1, "bit 5");
// })({
// 	locales: {
// 		es: "PPUStatus: lee `spriteOverflow` (bit 5)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUStatus: reads `sprite0Hit` (bit 6)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuStatus = ppu.registers.ppuStatus;
// 	byte.getBit(ppuStatus.onRead(), 6).should.equalN(0, "bit 6");
// 	ppuStatus.sprite0Hit = 1;
// 	byte.getBit(ppuStatus.onRead(), 6).should.equalN(1, "bit 6");
// })({
// 	locales: {
// 		es: "PPUStatus: lee `sprite0Hit` (bit 6)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });

// it("PPUStatus: reads `isInVBlankInterval` (bit 7) (ON by default)", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	const ppuStatus = ppu.registers.ppuStatus;
// 	byte.getBit(ppuStatus.onRead(), 7).should.equalN(1, "bit 7");
// 	ppuStatus.isInVBlankInterval = 0;
// 	byte.getBit(ppuStatus.onRead(), 7).should.equalN(0, "bit 7");
// 	ppuStatus.isInVBlankInterval = 1;
// 	byte.getBit(ppuStatus.onRead(), 7).should.equalN(1, "bit 7");
// })({
// 	locales: {
// 		es: "PPUStatus: lee `isInVBlankInterval` (bit 7) (encendido por defecto)",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.4"),
// });
