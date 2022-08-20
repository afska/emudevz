export default class PendingInput {
	constructor(resolve, reject) {
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
	}

	cancel() {
		this._reject();
	}
}
