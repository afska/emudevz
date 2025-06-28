const { evaluate, byte } = $;

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

// it("`/code/index.js` exports an object containing the `PPU` class", () => {
// 	expect(mainModule.default).to.be.an("object");
// 	mainModule.default.should.include.key("PPU");
// 	expect(mainModule.default.PPU).to.be.a.class;
// })({
// 	locales: {
// 		es: "`/code/index.js` exporta un objeto que contiene la clase `PPU`",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.1"),
// });

// it("receives and saves the `cpu` property", () => {
// 	const PPU = mainModule.default.PPU;
// 	const cpu = {};
// 	const ppu = new PPU(cpu);
// 	ppu.should.include.key("cpu");
// 	ppu.cpu.should.equal(cpu);
// })({
// 	locales: {
// 		es: "recibe y guarda una propiedad `cpu`",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.1"),
// });

// it("initializates the counters", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});

// 	ppu.should.include.key("cycle");
// 	ppu.should.include.key("scanline");
// 	ppu.should.include.key("frame");

// 	ppu.cycle.should.equalN(0, "cycle");
// 	ppu.scanline.should.equalN(-1, "scanline");
// 	ppu.frame.should.equalN(0, "frame");
// })({
// 	locales: {
// 		es: "inicializa los contadores",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.1"),
// });

// it("has a `step` method that increments the counters", () => {
// 	const PPU = mainModule.default.PPU;
// 	const ppu = new PPU({});
// 	ppu.memory?.onLoad?.(dummyCartridge, dummyMapper);
// 	ppu.onLoad?.(dummyMapper);
// 	ppu.should.respondTo("step");

// 	for (let frame = 0; frame < 1; frame++) {
// 		for (let scanline = -1; scanline < 261; scanline++) {
// 			for (let cycle = 0; cycle < 341; cycle++) {
// 				ppu.frame.should.equalN(frame, "frame");
// 				ppu.scanline.should.equalN(scanline, "scanline");
// 				ppu.cycle.should.equalN(cycle, "cycle");
// 				ppu.step(noop, noop);
// 			}
// 		}
// 	}

// 	ppu.frame.should.equalN(1, "frame");
// 	ppu.scanline.should.equalN(-1, "scanline");
// 	ppu.cycle.should.equalN(0, "cycle");
// })({
// 	locales: {
// 		es: "tiene un método `step` que incrementa los contadores",
// 	},
// 	use: ({ id }, book) => id >= book.getId("5c.1"),
// });
