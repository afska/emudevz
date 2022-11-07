const { evaluate } = $;

let hello;
beforeEach(async () => {
	hello = (await evaluate()).hello;
});

it(
	'the first letter from the returned string is a "w"',
	() => {
		expect(hello).to.be.a("function");
	},
	{
		locales: { en: 'la primer letra de la cadena retornada es una "w"' },
		use: ({ id }, book) => id >= book.getId("3.1"),
	}
);
