import en from "./en";
import es from "./es";

const DEFAULT_LANGUAGE = "en";

const locales = { en, es };

export default {
	get(key) {
		const strings = locales[this.language] ?? {};

		return strings[key] ?? locales[DEFAULT_LANGUAGE][key] ?? "[?]";
	},

	language: "en",
};

export const LANGUAGES = ["en", "es"];
