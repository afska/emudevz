import { cliCodeHighlighter } from "../utils/cli";

const SILENT_ACCENT = /(~[^~]+~)/;
const NUMBERS = /(\b[0-9]+\b)/;
const CODE_DETECT_REGEXP = /(```\S+\s+[^`]+```)/;
const CODE_PARSE_REGEXP = /```(\S+)\s+([^`]+)```/;
const RAW = "raw";

export default {
	highlightText(text) {
		let parts = [{ text }];

		parts = this._highlightCode(parts);
		[
			SILENT_ACCENT, // tilde (silent accent)
			/(`[^`]+`)/, // backticks
			/("[^"]+")/, // double quotes
			/(<[^>]+>)/, // angular brackets
			/([^\x1B]\[[^\]]+\])/, // square brackets (ignoring terminal sequences)
			/(#?\$[0-9a-fA-F]+)/, // [literal] hex numbers
			/(#[0-9]+)/, // literal dec numbers
			NUMBERS, // numbers
		].forEach((regexp) => {
			parts = this._highlightAccent(parts, regexp);
		});

		return parts;
	},

	_highlightAccent(parts, regexp) {
		return parts.flatMap((part) => {
			if (part.isAccent || part.isCode) return part;

			const subparts = part.text.split(regexp);
			return subparts.map((part, i) => {
				const isAccent = regexp.test(part);
				const isNumber = regexp === NUMBERS;
				const previousCharacter = subparts[i - 1]?.slice(-1);
				const isInvalidNumber =
					isNumber &&
					previousCharacter !== null &&
					!/\s/.test(previousCharacter);
				const isSilentAccent = SILENT_ACCENT.test(part);

				return {
					isAccent: isAccent && !isInvalidNumber,
					text: isSilentAccent ? part.replace(/~/g, "") : part,
					regexp,
				};
			});
		});
	},

	_highlightCode(parts) {
		return parts.flatMap((part) => {
			if (part.isAccent) return part;

			return part.text.split(CODE_DETECT_REGEXP).map((part) => {
				const isCode = CODE_PARSE_REGEXP.test(part);
				if (!isCode) return { isCode: false, text: part };

				const [, language, code] = part.match(CODE_PARSE_REGEXP);

				return {
					isCode: true,
					text:
						language === RAW
							? code
							: cliCodeHighlighter.highlight(code, language),
				};
			});
		});
	},
};
