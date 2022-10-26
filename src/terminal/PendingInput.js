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

	get text() {
		return this._text;
	}

	isEmpty() {
		return this._text === "";
	}

	getIndicatorOffset(y) {
		return y === this.position.y ? this.indicator.length : 0;
	}

	getLineLength(y, defaultValue) {
		const lineNumber = y - this.position.y;
		const line = this._text.split("\n")[lineNumber];
		return line?.length ?? defaultValue;
	}

	append(text) {
		this._text += text;
	}

	backspace() {
		const character = this._text[this._text.length - 1];
		this._text = this._text.substring(0, this._text.length - 1);
		return character;
	}

	confirm() {
		this._resolve(this._text);

		return this._isValid(this._text);
	}

	cancel(reason) {
		this._reject(reason);
	}
}

export class PendingKey {
	constructor(resolve, reject) {
		this.resolve = resolve;
		this.reject = reject;
	}
}
