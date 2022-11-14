import _ from "lodash";
import _filesystem_, { Drive as _Drive_ } from "../filesystem";
import _locales_ from "../locales";
import { bus as _bus_ } from "../utils";
import _Level_ from "./Level";

export default {
	eval(_code_, $ = {}) {
		if (_code_ == null) return;

		// eval scope:
		const level = _Level_.current;
		const layout = level.$layout;
		// eslint-disable-next-line
		const m = level.memory;
		// eslint-disable-next-line
		const set = (action) => level.setMemory(action);
		// eslint-disable-next-line
		const bus = _bus_;
		// eslint-disable-next-line
		const locales = _locales_;
		// eslint-disable-next-line
		const filesystem = _filesystem_;
		// eslint-disable-next-line
		const Drive = _Drive_;

		let _evalCode_ = _code_;
		_.forEach(layout.instances, (__, name) => {
			_evalCode_ = _evalCode_.replace(
				new RegExp(`{{${name}}}`, "g"),
				`layout.instances["${name}"]`
			);
		});

		try {
			return eval(_evalCode_);
		} catch (e) {
			debugger;
			const error = new Error(`Code eval failed: ${e}`);
			error.code = _evalCode_;
			error.inner = e;
			throw error;
		}
	},
};
