export default class PendingInput {
	constructor(indicator, resolve, reject) {
		this.indicator = indicator;

		this._text = "";
		this._resolve = resolve;
		this._reject = reject;
	}

	append(text) {
		this._text += text;
	}

	backspace() {
		this._text = this._text.substring(0, this._text.length - 1);
	}

	confirm() {
		this._resolve(this._text);

		return this._text;
	}

	cancel(reason) {
		this._reject(reason);
	}
}
