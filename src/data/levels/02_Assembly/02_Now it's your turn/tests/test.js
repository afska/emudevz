const { code, compile } = $;

let cpu;
beforeEach(() => {
	cpu = compile().cpu;
	cpu.run();
});

it("it doesn't load anything from the zero page", () => {
	if (/^LD[AXY] \$\d\d/m.test(code)) {
		throw new Error(
			"You code is probably doing something wrong.\nRemember: if you want to load a $99, it's `LDA #$99` instead of `LDA $99`"
		);
	}
})({
	locales: { es: "no carga nada de la página cero" },
});

it("the address $4055 contains $7C", () => {
	cpu.memory.readAt(0x4055).should.equalHex(0x7c, "readAt(0x4055)");
})({
	locales: { es: "la dirección $4055 contiene $7C" },
});

it("the address $4072 also contains $7C", () => {
	cpu.memory.readAt(0x4072).should.equalHex(0x7c, "readAt(0x4072)");
})({
	locales: { es: "la dirección $4072 también contiene $7C" },
});

it("the address $40B8 contains $18", () => {
	cpu.memory.readAt(0x40b8).should.equalHex(0x18, "readAt(0x40b8)");
})({
	locales: { es: "la dirección $40B8 contiene $18" },
});
