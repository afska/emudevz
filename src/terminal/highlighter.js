import { cliCodeHighlighter } from "../utils/cli";

const CODE_DETECT_REGEXP = /(```\S+\s+[^`]+```)/;
const CODE_PARSE_REGEXP = /```(\S+)\s+([^`]+)```/;

export default {
	highlightText(text) {
		let parts = [{ text }];

		parts = this._highlightCode(parts);
		[
			/(`[^`]+`)/, // backticks
			/("[^"]+")/, // quotes
			/(<[^>]+>)/, // angular brackets
			/(\[[^\]]+\])/, // square brackets
			/(#?\$[0-9a-fA-F]+)/, // [literal] hex numbers
			/(\b[0-9]+\b)/, // numbers
			/(#[0-9]+)/, // literal dec numbers
		].forEach((regexp) => {
			parts = this._highlightAccent(parts, regexp);
		});

		return parts;
	},

	_highlightAccent(parts, regexp) {
		return parts.flatMap((part) => {
			if (part.isAccent || part.isCode) return part;

			return part.text.split(regexp).map((part) => ({
				isAccent: regexp.test(part),
				text: part,
			}));
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
					text: cliCodeHighlighter.highlight(code, language),
				};
			});
		});
	},
};
