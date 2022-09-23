import { StreamLanguage } from "@codemirror/language";

function asm6502Mode() {
	const keywords = /^(ADC|ASL|DEC|DEX|DEY|INC|INX|INY|LSR|ROL|ROR|SBC|BCC|BCS|BEQ|BMI|BNE|BPL|BVC|BVS|JMP|JSR|RTI|RTS|BIT|CMP|CPX|CPY|CLC|CLD|CLI|CLV|LDA|LDX|LDY|PHA|PHP|PLA|PLP|SEC|SED|SEI|STA|STX|STY|TAX|TAY|TSX|TXA|TXS|TYA|AND|EOR|ORA|BRK|NOP)\b/i;
	const variables = /^(A|X|Y)\b/i;
	const numbers = /^([\da-f]+h|[0-7]+o|[01]+b|\d+d?)\b/i;

	return {
		startState: function () {
			return {
				context: 0,
			};
		},
		token: function (stream, state) {
			if (!stream.column()) state.context = 0;

			if (stream.eatSpace()) return null;

			let w;

			if (stream.eatWhile(/\w/)) {
				w = stream.current();

				if (true) {
					if (
						(state.context === 1 || state.context === 4) &&
						variables.test(w)
					) {
						state.context = 4;
						return "variable";
					}

					if (keywords.test(w)) {
						state.context = 1;
						return "keyword";
					} else if (state.context === 4 && numbers.test(w)) {
						return "number";
					}
				}
			} else if (stream.eat(";")) {
				stream.skipToEnd();
				return "comment";
			} else if (stream.eat('"')) {
				while ((w = stream.next())) {
					if (w === '"') break;

					if (w === "\\") stream.next();
				}
				return "string";
			} else if (stream.eat("'")) {
				if (stream.match(/\\?.'/)) return "number";
			} else if (stream.eat(".") || (stream.sol() && stream.eat("#"))) {
				state.context = 5;

				if (stream.eatWhile(/\w/)) return "def";
			} else if (stream.eat("$")) {
				if (stream.eatWhile(/[\da-f]/i)) return "number";
			} else if (stream.eat("%")) {
				if (stream.eatWhile(/[01]/)) return "number";
			} else {
				stream.next();
			}
			return null;
		},
	};
}

export default () => StreamLanguage.define(asm6502Mode());
