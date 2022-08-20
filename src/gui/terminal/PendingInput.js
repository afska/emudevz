export default class PendingInput {
	constructor(resolve, reject) {
		this._input = "";
		this._resolve = resolve;
		this._reject = reject;
	}

	append(data) {
		this._input += data;
	}

	confirm() {
		this._resolve(this._input);
	}

	cancel() {
		this._reject();
	}
}
