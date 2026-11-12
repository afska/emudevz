import TimeAgo from "javascript-time-ago";
import timeAgoEn from "javascript-time-ago/locale/en";
import timeAgoEs from "javascript-time-ago/locale/es";
import _ from "lodash";
import en from "./data/locales/en";
import es from "./data/locales/es";
import langPack from "./langPack";
import store from "./store";

TimeAgo.addLocale(timeAgoEn);
TimeAgo.addLocale(timeAgoEs);

export const DEFAULT_LANGUAGE = "en";

const locales = { en, es };
const timeAgo = {
	en: new TimeAgo("en"),
	es: new TimeAgo("es"),
};

export default {
	get(key, defaultValue = "[?]" + key) {
		const strings = locales[this.language] ?? langPack.current?.locales ?? {};

		return strings[key] ?? locales[DEFAULT_LANGUAGE][key] ?? defaultValue;
	},

	timeAgo(date) {
		return (timeAgo[this.language] ?? timeAgo[DEFAULT_LANGUAGE]).format(date);
	},

	get language() {
		const language = store.getState().savedata.language;
		return locales[language] || langPack.isActive ? language : DEFAULT_LANGUAGE;
	},
};

export const LANGUAGES = _.keys(locales);
