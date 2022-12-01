const { evaluate, filesystem } = $;

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
		es: "`/code/world.js` es un módulo JS que exporta una clase",
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
	mainModule.default.Cartridge.should.equal(Cartridge);
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase",
	},
});

// 3.2 The magic constant

it("instantiating a `Cartridge` with a valid header saves a `bytes` property", () => {
	const Cartridge = mainModule.default.Cartridge;
	const bytes = new Uint8Array([0x4e, 0x45, 0x53]);
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
		[0x11, 0x22, 0x33],
		[0x99, 0x45, 0x53],
		[0x4e, 0x99, 0x53],
		[0x4e, 0x45, 0x99],
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
