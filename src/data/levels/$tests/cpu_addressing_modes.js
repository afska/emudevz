const { evaluate, byte } = $;

let mainModule;
beforeEach(async () => {
	mainModule = await evaluate();
});

// [!] Duplicated >>>
const newHeader = (prgPages = 1, chrPages = 1) => {
	// prettier-ignore
	return [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, 0b00000000, 0b00000000, 0, 0, 0, 0, 0, 0, 0, 0];
};

const newRom = (prgBytes = []) => {
	const header = newHeader();
	const prg = prgBytes;
	const chr = [];
	for (let i = prgBytes.length; i < 16384; i++) prg.push(0);
	for (let i = 0; i < 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return bytes;
};

const newCPU = (prgBytes = null) => {
	const CPU = mainModule.default.CPU;
	const Cartridge = mainModule.default.Cartridge;

	const cartridge =
		prgBytes == null ? { prg: () => [] } : new Cartridge(newRom(prgBytes));

	return new CPU(cartridge);
};
// [!] Duplicated <<<

// 4.16 Addressing modes

it("`/code/index.js` exports an object containing the `addressingModes` object", () => {
	expect(mainModule.default).to.be.an("object");
	mainModule.default.should.include.key("addressingModes");
	expect(mainModule.default.addressingModes).to.be.an("object");
})({
	locales: {
		es:
			"`/code/index.js` exporta un objeto que contiene el objeto `addressingModes`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

it("`every member of the `addressingModes` object has an `id`", () => {
	const instructions = mainModule.default.addressingModes;

	for (let key in instructions) {
		instructions[key].should.include.key("id");
		instructions[key].id.should.equal(key);
	}
})({
	locales: {
		es: "cada miembro del objeto `addressingModes` tiene un `id`",
	},
	use: ({ id }, book) => id >= book.getId("4.16"),
});

// TODO: IMPLEMENT
