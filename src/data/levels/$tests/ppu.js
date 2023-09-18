const { evaluate, byte } = $;

let mainModule, Console;
before(async () => {
	mainModule = await evaluate();
});

const dummyCartridge = {};
const dummyMapper = {
	ppuRead: () => 0,
	ppuWrite: () => {},
};

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
	const noop = () => {};

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
	const noop = () => {};

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

it("includes a `memory` property with a `PPUMemory` instance", async () => {
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

it("includes a `memory` property with a `PPUMemory` instance", async () => {
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

it("its `memory` saves devices in `onLoad`", async () => {
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

it("connects the mapper into PPU memory (reads)", async () => {
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
		es: "conecta el mapper en la memoria de PPU (lecturas)",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});

it("connects the mapper into PPU memory (writes)", async () => {
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
		es: "conecta el mapper en la memoria de PPU (escrituras)",
	},
	use: ({ id }, book) => id >= book.getId("5b.4"),
});
