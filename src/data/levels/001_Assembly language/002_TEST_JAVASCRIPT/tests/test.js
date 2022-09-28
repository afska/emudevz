const { result } = $;

it("result is a function", () => {
	(typeof result).should.equal("function");
});

it("the function returns hello world", () => {
	result().should.equal("hello world");
});
