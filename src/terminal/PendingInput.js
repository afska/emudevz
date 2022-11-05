export default class PendingInput {
	constructor(indicator, isValid, resolve, reject) {
		this.indicator = indicator;
		this.multiLine = false;
		this.onChange = null;
		this.position = { x: 0, y: 0 };

		this._text = "";
		this._isValid = isValid;
		this._resolve = resolve;
		this._reject = reject;
	}

	get text() {
		return this._text;
	}

	set text(value) {
		this._text = value;
		if (this.onChange) this.onChange(this._text);
	}

	isEmpty() {
		return this.text === "";
	}

	getIndicatorOffset(y) {
		return y === this.position.y ? this.indicator.length : 0;
	}

	getLineLength(y, defaultValue) {
		const lineNumber = y - this.position.y;
		const line = this.text.split("\n")[lineNumber];
		return line?.length ?? defaultValue;
	}

	append(newText) {
		this.text += newText;
	}

	backspace() {
		const character = this.text[this.text.length - 1];
		this.text = this.text.substring(0, this.text.length - 1);
		if (this.onChange) this.onChange(this.text);
		return character;
	}

	confirm() {
		this._resolve(this.text);

		return this._isValid(this.text);
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
