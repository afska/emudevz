const { evaluate, filesystem } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

it("the file `/code/world.js` exists", () => {
	filesystem.exists("/code/world.js").should.be.true;
})({
	locales: { es: "el archivo `/code/world.js` existe" },
});

it('`/code/world.js` is a JS module that exports "w0rld"', async () => {
	const module = await evaluate("/code/world.js");
	expect(module?.default).to.exist;
	module.default.should.equal("w0rld");
})({
	locales: { es: '`/code/world.js` es un módulo JS que exporta "w0rld"' },
});

it("`/code/index.js` imports the module from `/code/world.js`", () => {
	expect($.modules["/code/world.js"]).to.exist;
})({
	locales: { es: "`/code/index.js` importa el módulo de `/code/world.js`" },
});

it('`/code/index.js` exports a function that returns "h3ll0 w0rld"', () => {
	expect(mainModule.default).to.be.a("function");
	mainModule.default().should.equal("h3ll0 w0rld");
})({
	locales: {
		es: '`/code/index.js` exporta una función que retorna "h3ll0 w0rld"',
	},
});
