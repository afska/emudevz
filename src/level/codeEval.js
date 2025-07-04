import _ from "lodash";
import _filesystem_, { Drive as _Drive_ } from "../filesystem";
import _locales_ from "../locales";
import _store_ from "../store";
import { bus as _bus_ } from "../utils";
import _Book_ from "./Book";
import _Level_ from "./Level";

export default {
	eval(_code_, $ = {}) {
		if (_code_ == null) return;

		// eval scope:
		// eslint-disable-next-line
		const book = _Book_.current;
		// eslint-disable-next-line
		const level = _Level_.current;
		// eslint-disable-next-line
		const layout = level.$layout;
		// eslint-disable-next-line
		const m = level.memory;
		// eslint-disable-next-line
		const set = (action) => level.setMemory(action);
		// eslint-disable-next-line
		const store = _store_;
		// eslint-disable-next-line
		const bus = _bus_;
		// eslint-disable-next-line
		const locales = _locales_;
		// eslint-disable-next-line
		const filesystem = _filesystem_;
		// eslint-disable-next-line
		const Drive = _Drive_;
		// eslint-disable-next-line
		const emulation = window.EMULATION;

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
			const error = new Error(`Code eval failed: ${e}`);
			error.code = _evalCode_;
			error.inner = e;
			throw error;
		}
	},
};
