const { evaluate, filesystem, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// 3.1 Using JS modules

it("`/code/Cartridge.js` exists as a file", () => {
	filesystem.exists("/code/Cartridge.js").should.be.true;
})({
	locales: { es: "`/code/Cartridge.js` existe como archivo" },
});

it("`/code/Cartridge.js` is a JS module that exports a class", async () => {
	const module = await evaluate("/code/Cartridge.js");
	expect(module?.default).to.exist;
	expect(module?.default).to.be.a.class;
})({
	locales: {
		es: "`/code/Cartridge.js` es un módulo JS que exporta una clase",
	},
});

it("`/code/index.js` imports the module from `/code/Cartridge.js`", () => {
	expect($.modules["/code/Cartridge.js"]).to.exist;
})({
	locales: { es: "`/code/index.js` importa el módulo de `/code/Cartridge.js`" },
});

it("`/code/index.js` exports an object containing the class", async () => {
	const Cartridge = (await evaluateModule($.modules["/code/Cartridge.js"]))
		.default;

	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("Cartridge");
	mainModule.default.Cartridge.should.equal(Cartridge);
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase",
	},
});

// 3.2 The magic constant

it("instantiating a `Cartridge` with a valid header saves a `bytes` property", () => {
	const Cartridge = mainModule.default.Cartridge;
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a]);
	new Cartridge(bytes).bytes.should.equal(bytes);
})({
	locales: {
		es:
			"instanciar un `Cartridge` con una cabecera válida guarda una propiedad `bytes`",
	},
	use: ({ id }, book) => id >= book.getId("3.2"),
});

it("instantiating a `Cartridge` with an invalid header throws an error", () => {
	const Cartridge = mainModule.default.Cartridge;

	[
		[0x11, 0x22, 0x33, 0x44],
		[0x99, 0x45, 0x53, 0x1a],
		[0x4e, 0x99, 0x53, 0x1a],
		[0x4e, 0x45, 0x99, 0x1a],
		[0x4e, 0x45, 0x53, 0x99],
	].forEach((wrongBytes) => {
		const bytes = new Uint8Array(wrongBytes);
		expect(() => new Cartridge(bytes)).to.throw(Error, "Invalid ROM.");
	});
})({
	locales: {
		es: "instanciar un `Cartridge` con una cabecera inválida tira un error",
	},
	use: ({ id }, book) => id >= book.getId("3.2"),
});

// 3.3 Reading the header

it("a `Cartridge` has a `header` property with metadata (PRG-ROM pages)", () => {
	const Cartridge = mainModule.default.Cartridge;
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	for (let i = 0; i < 255; i++) {
		bytes[4] = i;
		const header = new Cartridge(bytes).header;
		expect(header).to.be.an("object");
		header.should.include.key("prgRomPages");
		header.prgRomPages.should.equal(i);
	}
})({
	locales: {
		es:
			"un `Cartridge` tiene una propiedad `header` con metadatos (páginas de PRG-ROM)",
	},
	use: ({ id }, book) => id >= book.getId("3.3"),
});

it("a `Cartridge` has a `header` property with metadata (CHR-ROM pages)", () => {
	const Cartridge = mainModule.default.Cartridge;
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	for (let i = 0; i < 255; i++) {
		bytes[5] = i;
		const header = new Cartridge(bytes).header;
		expect(header).to.be.an("object");
		header.should.include.key("chrRomPages");
		header.chrRomPages.should.equal(i);
		header.should.include.key("usesChrRam");
		header.usesChrRam.should.equal(i === 0);
	}
})({
	locales: {
		es:
			"un `Cartridge` tiene una propiedad `header` con metadatos (páginas de CHR-ROM)",
	},
	use: ({ id }, book) => id >= book.getId("3.3"),
});

it("a `Cartridge` has a `header` property with metadata (512-byte padding)", () => {
	const Cartridge = mainModule.default.Cartridge;
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	[
		[false, 0b00000000],
		[true, 0b00000100],
	].forEach(([has512BytePadding, flags6]) => {
		bytes[6] = flags6;
		const header = new Cartridge(bytes).header;
		expect(header).to.be.an("object");
		header.should.include.key("has512BytePadding");
		header.has512BytePadding.should.equal(has512BytePadding);
	});
})({
	locales: {
		es:
			"un `Cartridge` tiene una propiedad `header` con metadatos (padding de 512 bytes)",
	},
	use: ({ id }, book) => id >= book.getId("3.3"),
});

it("a `Cartridge` has a `header` property with metadata (PRG-RAM presence)", () => {
	const Cartridge = mainModule.default.Cartridge;
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	[
		[false, 0b00000000],
		[true, 0b00000010],
	].forEach(([hasPrgRam, flags6]) => {
		bytes[6] = flags6;
		const header = new Cartridge(bytes).header;
		expect(header).to.be.an("object");
		header.should.include.key("hasPrgRam");
		header.hasPrgRam.should.equal(hasPrgRam);
	});
})({
	locales: {
		es:
			"un `Cartridge` tiene una propiedad `header` con metadatos (presencia de PRG-RAM)",
	},
	use: ({ id }, book) => id >= book.getId("3.3"),
});

it("a `Cartridge` has a `header` property with metadata (mirroring)", () => {
	const Cartridge = mainModule.default.Cartridge;
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	[
		["HORIZONTAL", 0b00000000],
		["VERTICAL", 0b00000001],
		["FOUR_SCREENS", 0b00001001],
		["FOUR_SCREENS", 0b00001000],
	].forEach(([mirroring, flags6]) => {
		bytes[6] = flags6;
		const header = new Cartridge(bytes).header;
		expect(header).to.be.an("object");
		header.should.include.key("mirroring");
		header.mirroring.should.equal(mirroring);
	});
})({
	locales: {
		es: "un `Cartridge` tiene una propiedad `header` con metadatos (mirroring)",
	},
	use: ({ id }, book) => id >= book.getId("3.3"),
});

it("a `Cartridge` has a `header` property with metadata (mapper id)", () => {
	const Cartridge = mainModule.default.Cartridge;
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	for (let i = 0; i < 255; i++) {
		const lowNybble = byte.lowNybbleOf(i);
		const highNybble = byte.highNybbleOf(i);
		bytes[6] = byte.buildU8(lowNybble, 0);
		bytes[7] = byte.buildU8(highNybble, 0);
		new Cartridge(bytes).header.mapperId.should.equal(i);
	}
})({
	locales: {
		es:
			"un `Cartridge` tiene una propiedad `header` con metadatos (id de mapper)",
	},
	use: ({ id }, book) => id >= book.getId("3.3"),
});

// 3.4 Locating the program

const buildHeader = (withPadding, flags6, prgPages, chrPages) => {
	// prettier-ignore
	const header = [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, 0b00000000, 0, 0, 0, 0, 0, 0, 0, 0];
	if (withPadding) header.push(...new Array(512).fill(0));
	return header;
};

const buildRom = (
	withPadding = false,
	flags6 = 0b00000000,
	prgPages = 1 + byte.random(3),
	chrPages = 1 + byte.random(3)
) => {
	const header = buildHeader(withPadding, flags6, prgPages, chrPages);
	const prg = [];
	const chr = [];
	for (let i = 0; i < prgPages * 16384; i++) prg.push(byte.random());
	for (let i = 0; i < chrPages * 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return { header, prg, chr, bytes };
};

it("a `Cartridge` has a `prg` method that returns the code (no padding)", () => {
	const Cartridge = mainModule.default.Cartridge;
	const { prg, bytes } = buildRom();

	const cartridge = new Cartridge(bytes);
	cartridge.should.respondTo("prg");
	cartridge.prg().should.eql(new Uint8Array(prg));
})({
	locales: {
		es:
			"un `Cartridge` tiene un método `prg` que retorna el código (sin relleno)",
	},
	use: ({ id }, book) => id >= book.getId("3.4"),
});

it("a `Cartridge` has a `prg` method that returns the code (with padding)", () => {
	const Cartridge = mainModule.default.Cartridge;
	const { prg, bytes } = buildRom(true, 0b00000100);

	const cartridge = new Cartridge(bytes);
	cartridge.should.respondTo("prg");
	cartridge.prg().should.eql(new Uint8Array(prg));
})({
	locales: {
		es:
			"un `Cartridge` tiene un método `prg` que retorna el código (con relleno)",
	},
	use: ({ id }, book) => id >= book.getId("3.4"),
});

// 3.5 Locating the graphics

it("a `Cartridge` has a `chr` method that returns the graphics (using CHR-ROM)", () => {
	const Cartridge = mainModule.default.Cartridge;
	const { chr, bytes } = buildRom();

	const cartridge = new Cartridge(bytes);
	cartridge.should.respondTo("chr");
	cartridge.chr().should.eql(new Uint8Array(chr));
})({
	locales: {
		es:
			"un `Cartridge` tiene un método `chr` que retorna los gráficos (usando CHR-ROM)",
	},
	use: ({ id }, book) => id >= book.getId("3.5"),
});

it("a `Cartridge` has a `chr` method that returns the graphics (using CHR-RAM)", () => {
	const Cartridge = mainModule.default.Cartridge;
	const { bytes } = buildRom(undefined, undefined, undefined, 0);

	const cartridge = new Cartridge(bytes);
	cartridge.should.respondTo("chr");
	cartridge.chr().should.eql(new Uint8Array(8192));
})({
	locales: {
		es:
			"un `Cartridge` tiene un método `chr` que retorna los gráficos (usando CHR-RAM)",
	},
	use: ({ id }, book) => id >= book.getId("3.5"),
});
