import escapeStringRegexp from "escape-string-regexp";
import { marked } from "marked";
import _ from "lodash";
import dictionaryEntries from "../data/dictionaryEntries";
import { sfx } from "../gui/sound";
import locales from "../locales";
import { toast } from "../utils";

const ENTRIES_TEMPLATE = _.template("(${entries})");

const dictionary = {
	entries: dictionaryEntries,

	showDefinition(word) {
		sfx.play("systemmsg");

		const { icon, name, text, usableKeys, otherKeys } = this.getDefinition(
			word
		);
		const html = this.parseLinks(marked.parseInline(text, []), usableKeys);
		const also = locales.get("also");
		const subtitle =
			otherKeys.length > 0
				? `<br /><span class="dictionary-entry-alt-names">(${also}: ${otherKeys.join(
						", "
				  )})</span>`
				: "";

		toast.normal(
			<span
				style={{ textAlign: "center" }}
				dangerouslySetInnerHTML={{
					__html: `<h5 class="dictionary-entry-name">${icon} ${name}${subtitle}</h5>\n${html}`,
				}}
			/>
		);
	},

	parseLinks(html, exclude = []) {
		const regexp = dictionary.getRegexp(exclude);
		const globalRegexp = new RegExp(regexp.source, regexp.flags + "g");

		return html.replace(
			globalRegexp,
			(word) =>
				`<a class="highlight-link" href="javascript:_showDefinition_('${word}')">${word}</a>`
		);
	},

	escapeLinks(text) {
		const regexp = dictionary.getRegexp();
		const globalRegexp = new RegExp(regexp.source, regexp.flags + "g");
		return text.replace(globalRegexp, (word) => `<${word}>`);
	},

	getEntries() {
		const keys = this._keys();
		const localizedKeys = _.flatMap(keys, (key) => this._getUsableKeysOf(key));
		return _.orderBy(localizedKeys, [(entry) => entry.length], ["desc"]);
	},

	getRegexp(exclude = []) {
		const entries = this.getEntries();
		return new RegExp(
			// eslint-disable-next-line
			ENTRIES_TEMPLATE({
				entries: entries
					.filter((word) => !exclude.some((it) => this._matchesKey(it, word)))
					.map((key) => {
						key = this._stripPrivateSymbol(key);
						return `(?<![^\\s(>])${escapeStringRegexp(
							key
						)}(?=[\\s0-9,.)?!:'<&]|$)`;
					})
					// before: string start, whitespace, parenthesis, major
					// after: whitespace, numbers, comma, dot, parenthesis, question mark, exclamation mark, colon, apostrophe, minor, ampersand, or end of string
					.join("|"),
			}),
			"iu"
		);
	},

	getDefinition(entry) {
		const keys = this._keys();
		const key = keys.find((key) => {
			const usableKeys = this._getUsableKeysOf(key);
			return usableKeys.some((usableKey) => this._matchesKey(usableKey, entry));
		});
		if (key == null) return null;

		const data = this.entries[key];
		const usableKeys = this._getUsableKeysOf(key);
		const otherKeys = usableKeys.filter((it, i) => {
			return i > 0 && !it.startsWith("_");
		});
		const name = usableKeys[0];

		return {
			icon: data.icon,
			name,
			text: this.entries[key][locales.language],
			usableKeys,
			otherKeys,
		};
	},

	_matchesKey(key, entry) {
		key = this._stripPrivateSymbol(key);
		return key.toLowerCase() === entry.toLowerCase();
	},

	_stripPrivateSymbol(key) {
		return key.startsWith("_") ? key.replace("_", "") : key;
	},

	_getUsableKeysOf(key) {
		const localizedKey = this.entries[key].also?.[locales.language];
		const usableKey = localizedKey != null ? localizedKey : key;
		return usableKey.split("|");
	},

	_keys() {
		return _(this.entries).keys().value();
	},
};

window._showDefinition_ = (word) => {
	dictionary.showDefinition(word);
};

export default dictionary;
