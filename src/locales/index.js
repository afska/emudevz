import _ from "lodash";
import store from "../store";
import en from "./en";
import es from "./es";

const DEFAULT_LANGUAGE = "en";

const locales = { en, es };

export default {
	get(key) {
		const strings = locales[this.language] ?? {};

		return strings[key] ?? locales[DEFAULT_LANGUAGE][key] ?? "[?]";
	},

	get language() {
		return store.getState().savedata.language;
	},
};

export const LANGUAGES = _.keys(locales);
