import _ from "lodash";
import $locales from "../locales";
import { bus as $bus } from "../utils";
import $Level from "./Level";

export default {
	eval(code, $ = {}) {
		if (code == null) return;

		// eval scope:
		const level = $Level.current;
		const layout = level.$layout;
		// eslint-disable-next-line
		const m = level.memory;
		// eslint-disable-next-line
		const set = (action) => level.setMemory(action);
		// eslint-disable-next-line
		const bus = $bus;
		// eslint-disable-next-line
		const locales = $locales;

		let evalCode = code;
		_.forEach(layout.instances, async (__, name) => {
			evalCode = evalCode.replace(
				new RegExp(`{{${name}}}`, "g"),
				`layout.instances["${name}"]`
			);
		});

		try {
			return eval(evalCode);
		} catch (e) {
			const error = new Error(`Code eval failed: ${e}`);
			error.code = evalCode;
			error.inner = e;
			throw error;
		}
	},
};
