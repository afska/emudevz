const { evaluate } = $;

let hello;
beforeEach(async () => {
	hello = (await evaluate()).hello;
});

it("it exports a hello function", () => {
	expect(hello).to.be.a("function");
});

it("the function returns world", function () {
	[1].forEach(() => {
		hello().should.equal("world" /* comment */); // comment!
	});
})({ es: "la función retorna mundo" });
