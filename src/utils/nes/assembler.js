import tools6502 from "@neshacker/6502-tools";

const { assemble } = require("@neshacker/6502-tools/src/assembler/assemble");
const {
	Instruction,
} = require("@neshacker/6502-tools/src/assembler/Instruction");
const { ParseLine, ParseError } = require("@neshacker/6502-tools/src/parser");
const lineParser = require("@neshacker/6502-tools/src/parser/lineParser");

function setNodeLine(line, node) {
	node.line = line;
	node.children.forEach((child) => setNodeLine(line, child));
}

export default {
	compile(asm) {
		return new Uint8Array(
			tools6502.Assembler.toHexString(asm)
				.match(/.{1,2}/g)
				.map((it) => parseInt(it, 16))
		);
	},

	inspect(asm) {
		const root = this._parse(asm);
		const instructions = [];

		assemble(root).forEach((lir) => {
			const address = lir.address;

			if (lir instanceof Instruction) {
				instructions.push({
					address,
					line: lir.source,
					lineNumber: lir.line.lineNumber - 1,
				});
			}
		});

		return instructions;
	},

	_parse(source) {
		const parsed = [];

		const lines = source
			.split("\n")
			.map(
				(sourceLine, index) =>
					new ParseLine({
						original: sourceLine + "\n",
						lineNumber: index + 1,
						assembly: sourceLine
							.replace(/^\s+/, "")
							.replace(/;.*/, "")
							.replace(/\s+$/, ""),
					})
			)
			.filter((line) => line.assembly.length > 0);

		for (const line of lines) {
			try {
				const node = lineParser.parse(line.assembly);
				if (Array.isArray(node)) {
					node.forEach((n) => {
						n.line = line;
						setNodeLine(line, n);
						parsed.push(n);
					});
				} else {
					setNodeLine(line, node);
					parsed.push(node);
				}
			} catch (err) {
				const parserError = new ParseError(err, line);
				parserError.err = err;
				throw parserError;
			}
		}
	},
};
