const { evaluate, filesystem, byte } = $;

let mainModule;
before(async () => {
	mainModule = await evaluate();
});

// 4.1 CPU Memory

it("`/code/CPUMemory.js` exists as a file", () => {
	filesystem.exists("/code/CPUMemory.js").should.be.true;
})({
	locales: { es: "`/code/CPUMemory.js` existe como archivo" },
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("`/code/CPUMemory.js` is a JS module that exports a class", async () => {
	const module = await evaluate("/code/CPUMemory.js");
	expect(module?.default).to.exist;
	expect(module?.default).to.be.a.class;
})({
	locales: {
		es: "`/code/CPUMemory.js` es un módulo JS que exporta una clase",
	},
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("`/code/index.js` imports the module from `/code/CPUMemory.js`", () => {
	expect($.modules["/code/CPUMemory.js"]).to.exist;
})({
	locales: { es: "`/code/index.js` importa el módulo de `/code/CPUMemory.js`" },
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("`/code/index.js` exports an object containing the class", async () => {
	mainModule = await evaluate();
	const CPUMemory = (await evaluateModule($.modules["/code/CPUMemory.js"]))
		.default;

	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("CPUMemory");
	mainModule.default.CPUMemory.should.equal(CPUMemory);
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase",
	},
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("has a `ram` property and `read`/`write` methods", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	memory.ram.should.be.a("Uint8Array");
	memory.should.respondTo("read");
	memory.should.respondTo("write");
})({
	locales: {
		es: "incluye una propiedad `ram` y métodos `read`/`write`",
	},
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("can read from RAM", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		memory.ram[i] = value;
		memory.read(i).should.equalN(value, `read(${i})`);
	}
})({
	locales: {
		es: "puede leer de RAM",
	},
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("reading RAM mirror results in RAM reads", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		memory.ram[(i - 0x0800) % 0x0800] = value;
		memory.read(i).should.equalN(value, `read(${i})`);
	}
})({
	locales: {
		es: "leer espejo de RAM ocasiona lecturas de RAM",
	},
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("can write to RAM", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		memory.write(i, value);
		memory.ram[i].should.equalN(value, `ram[${i}]`);
	}
})({
	locales: {
		es: "puede escribir en RAM",
	},
	use: (book) => book.isUnlockedHumanId("4.1"),
});

it("writing RAM mirror results in RAM writes", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		memory.write(i, value);
		const index = (i - 0x0800) % 0x0800;
		memory.ram[index].should.equalN(value, `ram[${index}]`);
	}
})({
	locales: {
		es: "escribir espejo de RAM ocasiona escrituras en RAM",
	},
	use: (book) => book.isUnlockedHumanId("4.1"),
});

// 4.2 Devices

it("saves the devices received by `onLoad`", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	const ppu = {};
	const apu = {};
	const mapper = {};
	const controllers = [];

	memory.should.respondTo("onLoad");
	memory.onLoad(ppu, apu, mapper, controllers);
	memory.ppu.should.equal(ppu);
	memory.apu.should.equal(apu);
	memory.mapper.should.equal(mapper);
	memory.controllers.should.equal(controllers);
})({
	locales: {
		es: "guarda los dispositivos recibidos por `onLoad`",
	},
	use: (book) => book.isUnlockedHumanId("4.2"),
});
