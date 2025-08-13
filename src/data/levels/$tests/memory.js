const { evaluate, filesystem, byte } = $;

let mainModule;
before(async () => {
	mainModule = await evaluate();
});

// 4.1 CPU Memory

it("there's a `/code/CPUMemory.js` file", () => {
	expect(filesystem.exists("/code/CPUMemory.js")).to.be.true;
})({
	locales: { es: "hay un archivo `/code/CPUMemory.js`" },
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("the file `/code/CPUMemory.js` is a JS module that exports <a class>", async () => {
	const module = await evaluate("/code/CPUMemory.js");
	expect(module?.default).to.exist;
	expect(module?.default).to.be.a.class;
})({
	locales: {
		es:
			"el archivo `/code/CPUMemory.js` es un módulo JS que exporta <una clase>",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("the file `/code/index.js` <imports> the module from `/code/CPUMemory.js`", () => {
	expect($.modules["/code/CPUMemory.js"]).to.exist;
})({
	locales: {
		es:
			"el archivo `/code/index.js` <importa> el módulo de `/code/CPUMemory.js`",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("the file `/code/index.js` exports <an object> containing the class", async () => {
	mainModule = await evaluate();
	const CPUMemory = (await evaluateModule($.modules["/code/CPUMemory.js"]))
		.default;

	expect(mainModule.default).to.be.an("object");
	expect(mainModule.default).to.include.key("CPUMemory");
	expect(mainModule.default.CPUMemory).to.equalN(CPUMemory, "CPUMemory");
})({
	locales: {
		es: "el archivo `/code/index.js` exporta <un objeto> que contiene la clase",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("has a `ram` property and `read(...)`/`write(...)` methods", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	expect(memory).to.include.key("ram");
	expect(memory.ram).to.be.a("Uint8Array");
	expect(memory.ram.length).to.equalN(2048, "length");
	expect(memory).to.respondTo("read");
	expect(memory).to.respondTo("write");
})({
	locales: {
		es: "incluye una propiedad `ram` y métodos `read(...)`/`write(...)`",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("can read from RAM ($0000-$07FF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		memory.ram[i] = value;
		expect(memory.read(i)).to.equalN(value, `read(${i})`);
	}
})({
	locales: {
		es: "puede leer de RAM  ($0000-$07FF)",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("reading RAM mirror results in <RAM reads>", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		memory.ram[(i - 0x0800) % 0x0800] = value;
		expect(memory.read(i)).to.equalN(value, `read(${i})`);
	}
})({
	locales: {
		es: "leer espejo de RAM ocasiona <lecturas de RAM>",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("can write to RAM ($0000-$07FF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0; i < 2048; i++) {
		const value = byte.random();
		memory.write(i, value);
		expect(memory.ram[i]).to.equalN(value, `ram[${i}]`);
	}
})({
	locales: {
		es: "puede escribir en RAM ($0000-$07FF)",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

it("writing RAM mirror results in <RAM writes>", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	for (let i = 0x0800; i < 0x0800 + 0x1800; i++) {
		const value = byte.random();
		memory.write(i, value);
		const index = (i - 0x0800) % 0x0800;
		expect(memory.ram[index]).to.equalN(value, `ram[${index}]`);
	}
})({
	locales: {
		es: "escribir espejo de RAM ocasiona <escrituras en RAM>",
	},
	use: ({ id }, book) => id >= book.getId("4.1"),
});

// 4.2 Devices

it("saves the <devices> received by `onLoad(...)`", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();

	const ppu = {};
	const apu = {};
	const mapper = {};
	const controllers = [];

	expect(memory).to.respondTo("onLoad");
	memory.onLoad(ppu, apu, mapper, controllers);
	expect(memory.ppu).to.equalN(ppu, "ppu");
	expect(memory.apu).to.equalN(apu, "apu");
	expect(memory.mapper).to.equalN(mapper, "mapper");
	expect(memory.controllers).to.equalN(controllers, "controllers");
})({
	locales: {
		es: "guarda los <dispositivos> recibidos por `onLoad(...)`",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("can read from the mapper ($4020-$FFFF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();
	const random = byte.random();
	const mapper = {
		cpuRead: (address) => address * random,
		cpuWrite: () => {},
	};
	memory.onLoad({}, {}, mapper, []);

	for (let i = 0x4020; i <= 0xffff; i++) {
		expect(memory.read(i)).to.equalHex(i * random, `read(${i})`);
	}
})({
	locales: {
		es: "puede leer del mapper ($4020-$FFFF)",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});

it("can write to the mapper ($4020-$FFFF)", () => {
	const CPUMemory = mainModule.default.CPUMemory;
	const memory = new CPUMemory();
	let arg1 = -1,
		arg2 = -1;
	const mapper = {
		cpuRead: () => 0,
		cpuWrite: (a, b) => {
			arg1 = a;
			arg2 = b;
		},
	};
	memory.onLoad({}, {}, mapper, []);

	for (let i = 0x4020; i <= 0xffff; i++) {
		const value = byte.random();
		memory.write(i, value);
		expect(arg1).to.equalHex(i, "address");
		expect(arg2).to.equalHex(value, "value");
	}
})({
	locales: {
		es: "puede escribir en el mapper ($4020-$FFFF)",
	},
	use: ({ id }, book) => id >= book.getId("4.2"),
});
