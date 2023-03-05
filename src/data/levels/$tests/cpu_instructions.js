const { evaluate, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// 4.11 Instructions (1/6): Arithmetic

it("`/code/index.js` exports an object containing the `instructions` object", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("instructions");
	expect(mainModule.default.instructions).to.be.an("object");
})({
	locales: {
		es:
			"`/code/index.js` exporta un objeto que contiene el objeto `instructions`",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});

it("INX: argument == 'no'", () => {
	const instructions = mainModule.default.instructions;
	instructions.should.include.key("INX");
	expect(instructions.INX).to.be.an("object");
	instructions.INX.argument.should.equal("no");
})({
	locales: {
		es: "INX: argument == 'no'",
	},
	use: ({ id }, book) => id >= book.getId("4.11"),
});
