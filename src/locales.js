import TimeAgo from "javascript-time-ago";
import timeAgoEn from "javascript-time-ago/locale/en";
import timeAgoEs from "javascript-time-ago/locale/es";
import timeAgoFr from "javascript-time-ago/locale/fr";
import timeAgoRu from "javascript-time-ago/locale/ru";
import _ from "lodash";
import en from "./data/locales/en";
import es from "./data/locales/es";
import fr from "./data/locales/fr";
import ru from "./data/locales/ru";
import store from "./store";

TimeAgo.addLocale(timeAgoEn);
TimeAgo.addLocale(timeAgoEs);
TimeAgo.addLocale(timeAgoFr);
TimeAgo.addLocale(timeAgoRu);

const DEFAULT_LANGUAGE = "en";

const locales = { en, es, fr, ru };
const timeAgo = {
	en: new TimeAgo("en"),
	es: new TimeAgo("es"),
	fr: new TimeAgo("fr"),
	ru: new TimeAgo("ru"),
};

export default {
	get(key, defaultValue = "[?]" + key) {
		const strings = locales[this.language] ?? {};

		return strings[key] ?? locales[DEFAULT_LANGUAGE][key] ?? defaultValue;
	},

	timeAgo(date) {
		return timeAgo[this.language].format(date);
	},

	get language() {
		const language = store.getState().savedata.language;
		return locales[language] ? language : DEFAULT_LANGUAGE;
	},
};

export const LANGUAGES = _.keys(locales);
