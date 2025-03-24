import { cliCodeHighlighter } from "../utils/cli";
import { theme } from "./style";

const NUMBERS = /(\b[0-9]+\b)/;
const CODE_DETECT_REGEXP = /(```\S+\s+[^`]+```)/;
const CODE_PARSE_REGEXP = /```(\S+)\s+([^`]+)```/;
const RAW = "raw";

export default {
	SILENT_CHARACTERS: /[~<>`]/g,

	highlightText(text, dictionaryRegexp = null) {
		let parts = [{ text }];

		parts = this._highlightCode(parts);
		[
			{
				regexp: /(<\{[^*]+\}>)/,
				silent: /(<\{([^*]+)\}>)/g,
				style: theme.IMAGE,
				raw: true,
			}, // <{image}>
			{
				regexp: /(\*_-_\*[^*]+\*\*)/,
				silent: /(\*_-_\*([^*]+)\*\*)/g,
				style: theme.HIGHLIGHTED_BOLD,
			}, // **highlighted bold**
			{
				regexp: /(_-_)/,
				silent: /(_-_)/g,
				style: theme.BG_HIGHLIGHT_START,
			}, // /highlight start/
			{
				regexp: /(_--_)/,
				silent: /(_--_)/g,
				style: theme.BG_HIGHLIGHT_END,
			}, // /highlight end/
			{
				regexp: /(\*\*[^*]+\*\*)/,
				silent: /(\*\*([^*]+)\*\*)/g,
				style: theme.BOLD,
			}, // **quick bold**
			{
				regexp: /(__[^_]+__)/,
				silent: /(__([^_]+)__)/g,
				style: theme.ITALIC,
			}, // __quick italic__
			{ regexp: /(~[^~]+~)/, silent: /(~([^~]+)~)/g, style: theme.ACCENT2 }, // ~quick accent~
			{ regexp: /(<[^>]+>)/, silent: /(<([^~]+)>)/g }, // <angular brackets>
			{ regexp: /(`[^`]+`)/, silent: /(`([^~]+)`)/g }, // `backticks`
			{ regexp: /("[^"]+")/ }, // "double quotes"
			{ regexp: /(\[[^\];]+\])/ }, // [square brackets] (ignoring terminal sequences)
			{ regexp: /(#?\$[0-9a-fA-F]+)/ }, // #literal hex numbers
			{ regexp: /(#[0-9]+)/ }, // #literal dec numbers
			{ regexp: NUMBERS }, // numbers
		].forEach((symbol) => {
			parts = this._highlightAccent(parts, symbol);
		});

		if (dictionaryRegexp != null) {
			parts = this._highlightAccent(parts, {
				regexp: dictionaryRegexp,
				style: theme.DICTIONARY,
			});
		}

		return parts;
	},

	_highlightAccent(parts, symbol) {
		const { regexp, silent = null, style = theme.ACCENT, raw = false } = symbol;

		return parts.flatMap((part) => {
			if (part.isAccent || part.isCode) return part;

			const subparts = part.text.split(regexp);
			return subparts.map((part, i) => {
				const isMatch = regexp.test(part);
				const isNumber = regexp === NUMBERS;
				const previousCharacter = subparts[i - 1]?.slice(-1);
				const isInvalidNumber =
					isNumber &&
					previousCharacter !== null &&
					!/\s/.test(previousCharacter);
				const isValid = isMatch && !isInvalidNumber;
				const isValidAccent = !raw && isValid;
				const isValidCode = raw && isValid;

				return {
					isAccent: isValidAccent,
					isCode: isValidCode,
					style,
					text:
						isValid && silent != null
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
					style: theme.NORMAL,
					text:
						language === RAW
							? code
							: cliCodeHighlighter.highlight(code, language),
				};
			});
		});
	},
};
