import { Instruction } from "@neshacker/6502-tools/src/assembler/Instruction";
import { assemble } from "@neshacker/6502-tools/src/assembler/assemble";
import { ParseError, ParseLine } from "@neshacker/6502-tools/src/parser";
import ParseNode from "@neshacker/6502-tools/src/parser/ParseNode";
import lineParser from "@neshacker/6502-tools/src/parser/lineParser";

function setNodeLine(line, node) {
	node.line = line;
	node.children.forEach((child) => setNodeLine(line, child));
}

export default {
	compile(asm) {
		const root = this._parse(asm);
		const lir = assemble(root);

		// instructions
		const instructions = [];
		lir.forEach((lir) => {
			const address = lir.address;

			if (lir instanceof Instruction) {
				instructions.push({
					address,
					line: lir.source,
					lineIndex: lir.line.lineNumber - 1,
					size: lir.bytes.length,
				});
			}
		});

		// bytes
		const hex = [];
		const nonLabels = lir.filter(
			(v) => v instanceof Instruction || v instanceof Uint8Array
		);
		nonLabels.forEach((nonLabel) => {
			if (!nonLabel.bytes || nonLabel.bytes.length === 0) {
				const { lineNumber } = nonLabel.line;
				const { source } = nonLabel;
				throw new Error(
					`Assembly Error: Unable to generate hex for line ${lineNumber} "${source}".`
				);
			}
			for (let byte of nonLabel._bytes) hex.push(byte);
		});
		const bytes = new Uint8Array(hex);

		return { bytes, instructions };
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
			} catch (e) {
				const parserError = new ParseError(e, line);
				parserError.err = e;
				parserError.lineNumber = line.lineNumber;
				throw parserError;
			}
		}

		return ParseNode.statementList(parsed);
	},
};
