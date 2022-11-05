import _ from "lodash";

const KEY_UP = "[A";
const KEY_DOWN = "[B";

export default class Program {
	constructor(terminal) {
		this._terminal = terminal;

		this._inputHistory = [];
		this._inputHistoryCursor = 0;
		this._inputBackup = "";
	}

	async run(args) {}

	onInput(input) {
		if (this.usesInputHistory() && !this.$loadingHistory)
			this._inputBackup = input;
	}

	async onData(data) {
		if (this.usesInputHistory()) await this._processInputHistory(data);
	}

	onStop() {
		return true;
	}

	usesAutocomplete() {
		return false;
	}

	usesInputHistory() {
		return false;
	}

	async _processInputHistory(data) {
		if (data === KEY_UP && !_.isEmpty(this._inputHistory)) {
			const commandLine = this._inputHistory[
				this._inputHistory.length - 1 - this._inputHistoryCursor
			];
			if (!commandLine) return;

			await this._loadHistory(commandLine);
			this._inputHistoryCursor++;
		}

		if (data === KEY_DOWN && this._inputHistoryCursor > 0) {
			this._inputHistoryCursor--;
			await this._loadHistory(
				this._inputHistoryCursor === 0
					? this._inputBackup
					: this._inputHistory[
							this._inputHistory.length - this._inputHistoryCursor
					  ]
			);
		}
	}

	_addInputHistory(input) {
		this._inputHistory.push(input);
		this._inputHistoryCursor = 0;
		this._inputBackup = "";
	}

	async _loadHistory(commandLine) {
		this.$loadingHistory = true;
		try {
			await this._terminal.clearInput();
			await this._terminal.addInput(commandLine);
		} finally {
			this.$loadingHistory = false;
		}
	}
}
