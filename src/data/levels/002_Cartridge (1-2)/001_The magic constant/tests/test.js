const { evaluate, filesystem } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

it("instantiating a `Cartridge` saves a `bytes` property", () => {
	const Cartridge = mainModule.default.Cartridge;
	const bytes = new Uint8Array([0x4e, 0x45, 0x53]);
	new Cartridge(bytes).bytes.should.equal(bytes);
})({
	locales: { es: "instanciar un `Cartridge` guarda una propiedad `bytes`" },
});

it("instantiating a `Cartridge` throws an error if <the magic constant> doesn't match", () => {
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
		es:
			"instanciar un `Cartridge` tira un error si <la constante mágica> no coincide",
	},
});
