const { evaluate, filesystem } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

it("`/code/Cartridge.js` exists as a file", () => {
	filesystem.exists("/code/Cartridge.js").should.be.true;
})({
	locales: { es: "`/code/Cartridge.js` existe como archivo" },
});

it("`/code/Cartridge.js` is a JS module that exports a class", async () => {
	const module = await evaluate("/code/Cartridge.js");
	expect(module?.default).to.exist;
	isClass(module.default).should.be.true;
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
	Object.keys(mainModule.default).should.eql(["Cartridge"]);
	mainModule.default.Cartridge.should.equal(Cartridge);
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase",
	},
});
