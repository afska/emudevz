const { evaluate, byte } = $;

let mainModule, Console;
beforeEach(async () => {
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

	for (let frame = 0; frame < 1; frame++) {
		for (let scanline = -1; scanline < 261; scanline++) {
			for (let cycle = 0; cycle < 341; cycle++) {
				ppu.frame.should.equal(frame);
				ppu.scanline.should.equal(scanline);
				ppu.cycle.should.equal(cycle);
				ppu.step();
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
