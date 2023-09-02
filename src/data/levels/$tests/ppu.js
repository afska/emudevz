const { evaluate, byte } = $;

let mainModule, Console;
before(async () => {
	mainModule = await evaluate();
});

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
})({
	locales: {
		es: "define una propiedad `frameBuffer`",
	},
	use: ({ id }, book) => id >= book.getId("5b.2"),
});

it("calls `onFrame` every time `step(...)` reaches a new frame", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
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

it("calls `onFrame` with a red screen", () => {
	const PPU = mainModule.default.PPU;
	const ppu = new PPU({});
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
	const frameBuffer = onFrame.getCall(0).args[0];
	for (let i = 0; i < 256 * 240; i++) {
		frameBuffer[i].should.equalHex(0xff0000ff, `frameBuffer[${i}]`);
	}
})({
	locales: {
		es: "llama a `onFrame` con una pantalla roja",
	},
	use: ({ id }, book) => id === book.getId("5b.2"),
});
