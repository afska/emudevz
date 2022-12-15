import { cliCodeHighlighter } from "../utils/cli";
import { theme } from "./style";

const NUMBERS = /(\b[0-9]+\b)/;
const CODE_DETECT_REGEXP = /(```\S+\s+[^`]+```)/;
const CODE_PARSE_REGEXP = /```(\S+)\s+([^`]+)```/;
const RAW = "raw";

export default {
	highlightText(text) {
		let parts = [{ text }];

		parts = this._highlightCode(parts);
		[
			{
				regexp: /(\*\*[^\*]+\*\*)/,
				silent: /(\*\*([^\*]+)\*\*)/g,
				style: theme.BOLD,
			}, // quick bold
			{
				regexp: /(__[^_]+__)/,
				silent: /(__([^_]+)__)/g,
				style: theme.ITALIC,
			}, // quick italic
			{ regexp: /(~[^~]+~)/, silent: /(~([^~]+)~)/g }, // quick accent
			{ regexp: /(`[^`]+`)/ }, // backticks
			{ regexp: /("[^"]+")/ }, // double quotes
			{ regexp: /(<[^>]+>)/ }, // angular brackets
			{ regexp: /([^\x1B]\[[^\]]+\])/ }, // square brackets (ignoring terminal sequences)
			{ regexp: /(#?\$[0-9a-fA-F]+)/ }, // [literal] hex numbers
			{ regexp: /(#[0-9]+)/ }, // literal dec numbers
			{ regexp: NUMBERS }, // numbers
		].forEach((symbol) => {
			parts = this._highlightAccent(parts, symbol);
		});

		return parts;
	},

	_highlightAccent(parts, symbol) {
		const { regexp, silent = null, style = theme.ACCENT } = symbol;

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
				const isValidAccent = isAccent && !isInvalidNumber;

				return {
					isAccent: isValidAccent,
					style,
					text:
						isValidAccent && silent != null
							? part.replace(silent, (__, ___, inner) => inner)
							: part,
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
