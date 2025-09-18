export default class PendingInput {
	constructor(indicator, isValid, resolve, reject) {
		this.indicator = indicator;
		this.multiLine = false;
		this.onChange = null;
		this.position = { x: 0, y: 0 };

		this._text = "";
		this._caretIndex = 0;
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

	get caretIndex() {
		return this._caretIndex;
	}

	set caretIndex(value) {
		if (value < 0) value = 0;
		if (value > this._text.length) value = this._text.length;
		this._caretIndex = value;
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
		this._caretIndex = this._text.length;
	}

	backspace() {
		const character = this.text[this.text.length - 1];
		this.text = this.text.substring(0, this.text.length - 1);
		if (this.onChange) this.onChange(this.text);
		return character;
	}

	insertAtCaret(newText) {
		const before = this._text.substring(0, this._caretIndex);
		const after = this._text.substring(this._caretIndex);
		this.text = before + newText + after;
		this._caretIndex += newText.length;
	}

	deleteBackwardAtCaret() {
		if (this._caretIndex === 0) return null;

		const before = this._text.substring(0, this._caretIndex - 1);
		const character = this._text.substring(
			this._caretIndex - 1,
			this._caretIndex
		);
		const after = this._text.substring(this._caretIndex);
		this.text = before + after;
		this._caretIndex--;
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
