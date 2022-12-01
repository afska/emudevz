const { evaluate, filesystem, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// 3.1 New CPU

it("`/code/CPU.js` exists as a file", () => {
	filesystem.exists("/code/CPU.js").should.be.true;
})({
	locales: { es: "`/code/CPU.js` existe como archivo" },
});

it("`/code/CPU.js` is a JS module that exports a class", async () => {
	const module = await evaluate("/code/CPU.js");
	expect(module?.default).to.exist;
	expect(module?.default).to.be.a.class;
})({
	locales: {
		es: "`/code/CPU.js` es un módulo JS que exporta una clase",
	},
});

it("`/code/index.js` imports the module from `/code/CPU.js`", () => {
	expect($.modules["/code/CPU.js"]).to.exist;
})({
	locales: { es: "`/code/index.js` importa el módulo de `/code/CPU.js`" },
});

it("`/code/index.js` exports an object containing the class", async () => {
	const CPU = (await evaluateModule($.modules["/code/CPU.js"])).default;

	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("CPU");
	mainModule.default.CPU.should.equal(CPU);
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase",
	},
});
