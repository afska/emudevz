export default class PendingInput {
	constructor(indicator, isValid, resolve, reject) {
		this.indicator = indicator;

		this._text = "";
		this._isValid = isValid;
		this._resolve = resolve;
		this._reject = reject;
	}

	isEmpty() {
		return this._text === "";
	}

	append(text) {
		this._text += text;
	}

	backspace() {
		this._text = this._text.substring(0, this._text.length - 1);
	}

	confirm() {
		this._resolve(this._text);

		return this._isValid(this._text);
	}

	cancel(reason) {
		this._reject(reason);
	}
}
