export default class PendingInput {
	constructor(indicator, isValid, resolve, reject) {
		this.indicator = indicator;
		this.multiLine = false;
		this.position = { x: 0, y: 0 };

		this._text = "";
		this._isValid = isValid;
		this._resolve = resolve;
		this._reject = reject;
	}

	isEmpty() {
		return this._text === "";
	}

	getIndicatorOffset(y) {
		return y === this.position.y ? this.indicator.length : 0;
	}

	getLineLength(y) {
		const lineNumber = y - this.position.y;
		const line = this._text.split("\n")[lineNumber];
		return line?.length;
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
