const { evaluate, filesystem, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// 4.1 New CPU

it("`/code/index.js` exports an object containing the CPU class", async () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("CPU");
	expect(mainModule.default.CPU).to.be.a.class;
})({
	locales: {
		es: "`/code/index.js` exporta un objeto que contiene la clase",
	},
});
