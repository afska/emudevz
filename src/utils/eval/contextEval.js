import { byte as _byte_ } from "../../utils";

const _INVALID_CHARACTERS_ = /[^_$a-zA-Z0-9]/;

export default {
	create: ($ = {}, _include_ = _DEFAULT_SCOPE_) => {
		// eslint-disable-next-line
		const byte = _byte_;

		let _firstTime_ = true;

		const _globals_ = Object.getOwnPropertyNames(window);
		let _clearGlobals_ = "";
		for (let i = 0, len = _globals_.length; i < len; i++) {
			if ((_include_ && _include_.indexOf(_globals_[i]) === -1) || !_include_) {
				if (
					!_INVALID_CHARACTERS_.test(_globals_[i]) &&
					/^[_A-Za-z]/.test(_globals_[i])
				)
					_clearGlobals_ += `var ${_globals_[i]} = undefined;\n`;
			}
		}

		var _eval_;
		// eslint-disable-next-line
		eval("_eval_ = (s) => eval(`void (_eval_ = ${_eval_}); ${s}`)");

		return {
			eval(_code_) {
				const result = _eval_(_firstTime_ ? _clearGlobals_ + _code_ : _code_);
				_firstTime_ = false;

				return result;
			},
		};
	},
};

const _DEFAULT_SCOPE_ = [
	"eval",
	"Function",
	"Object",
	"Array",
	"String",
	"Symbol",
	"Number",
	"Boolean",
	"Date",
	"RegExp",
	"Error",
	"Map",
	"WeakMap",
	"Set",
	"WeakSet",
	"Proxy",
	"ArrayBuffer",
	"Uint8Array",
	"Int8Array",
	"Uint16Array",
	"Int16Array",
	"Uint32Array",
	"Int32Array",
	"Float32Array",
	"Float64Array",
	"Uint8ClampedArray",
	"BigUint64Array",
	"BigInt64Array",
	"JSON",
	"Math",
	"Infinity",
	"NaN",
	"parseInt",
	"parseFloat",
	"isFinite",
	"isNaN",
	"atob",
	"btoa",
];
