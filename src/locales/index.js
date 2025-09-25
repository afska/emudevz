import TimeAgo from "javascript-time-ago";
import timeAgoEn from "javascript-time-ago/locale/en";
import timeAgoEs from "javascript-time-ago/locale/es";
import _ from "lodash";
import store from "../store";
import en from "./en";
import es from "./es";

TimeAgo.addLocale(timeAgoEn);
TimeAgo.addLocale(timeAgoEs);

const DEFAULT_LANGUAGE = "en";

const locales = { en, es };
const timeAgo = {
	en: new TimeAgo("en"),
	es: new TimeAgo("es"),
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
		return store.getState().savedata.language;
	},
};

export const LANGUAGES = _.keys(locales);
