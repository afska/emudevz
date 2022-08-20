import locales from "./locales";

const DEFAULT_LANGUAGE = "en";

export default {
	get(key) {
		const translations = locales[key] ?? {};

		return (
			translations[this.language] ?? translations[DEFAULT_LANGUAGE] ?? "[?]"
		);
	},

	language: "en",
};

export const LANGUAGES = ["en", "es"];
