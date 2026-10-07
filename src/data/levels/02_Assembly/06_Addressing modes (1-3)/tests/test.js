const { compile } = $;

let instructions, bytes;
beforeEach(() => {
	const compilation = compile();
	instructions = compilation.instructions;
	bytes = compilation.bytes;
	compilation.cpu.run();
});

it("the first 7 instructions are equal", () => {
	expect(instructions[0]?.line).to.eqNoCase("INX", "1st instruction");
	expect(instructions[1]?.line).to.eqNoCase("LDA #$08", "2nd instruction");
	expect(instructions[2]?.line).to.eqNoCase("LDA $C002", "3rd instruction");
	expect(instructions[3]?.line).to.eqNoCase("LDA $15", "4th instruction");
	expect(instructions[4]?.line).to.eqNoCase("BNE @label", "5th instruction");
	expect(instructions[5]?.line).to.eqNoCase("INY", "6th instruction");
	expect(instructions[6]?.line).to.eqNoCase("INY", "7th instruction");
})({
	locales: {
		ru: "первые 7 инструкций не меняются",
		es: "las primeras 7 instrucciones son iguales",
	},
});

it("sets up an indirect jump to $403C", () => {
	expect(instructions[7]?.line).to.eqNoCase("LDA #$3C", "8th instruction");
	expect(instructions[8]?.line).to.eqNoCase("STA $4080", "9th instruction");
	expect(instructions[9]?.line).to.eqNoCase("LDA #$40", "10th instruction");
	expect(instructions[10]?.line).to.eqNoCase("STA $4081", "11th instruction");
	expect(instructions[11]?.line).to.eqNoCase("JMP ($4080)", "12th instruction");
})({
	locales: {
		ru: "настраивает косвенный переход на $403C",
		es: "configura un salto indirecto hacia $403C",
	},
});

it("the last 2 instructions are `STY $1001` and `INX`", () => {
	expect(instructions[instructions.length - 2]?.line).to.eqNoCase(
		"STY $1001",
		"penultimate instruction"
	);
	expect(instructions[instructions.length - 1]?.line).to.eqNoCase(
		"INX",
		"last instruction"
	);
})({
	locales: {
		ru: "последние 2 инструкции — `STY $1001` и `INX`",
		es: "las últimas dos instrucciones son `STY $1001` y `INX`",
	},
});

it("the assembled code is OK", () => {
	// prettier-ignore
	expect(bytes).to.eql(
		new Uint8Array([0xe8, 0xa9, 0x08, 0xad, 0x02, 0xc0, 0xa5, 0x15, 0xd0, 0x02, 0xc8, 0xc8, 0xa9, 0x3c, 0x8d, 0x80, 0x40, 0xa9, 0x40, 0x8d, 0x81, 0x40, 0x6c, 0x80, 0x40, 0x8c, 0x01, 0x10, 0xe8])
	);
})({
	locales: {
		ru: "код ассемблируется правильно",
		es: "el código ensamblado está bien",
	},
});
