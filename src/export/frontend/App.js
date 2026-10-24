import Emulator from "./Emulator.js";
import TVNoise from "./video/TVNoise.js";

export default class App {
	constructor() {
		this.gameContainer = document.querySelector("#game");
		this._showNoise();

		window.addEventListener("dragover", this._ignore);
		window.addEventListener("dragenter", this._ignore);
		window.addEventListener("drop", this._onFileDrop);
		window.addEventListener("pagehide", this._stop);
	}

	_loadRom(rom) {
		this._stop();

		this.emulator = new Emulator(this._onError);
		this.gameContainer.replaceChildren(this.emulator.canvas);
		this.emulator.initialize(rom);
	}

	_showNoise() {
		this.noise = new TVNoise();
		this.gameContainer.replaceChildren(this.noise.canvas);
	}

	_stop = () => {
		this.emulator?.stop();
		this.emulator = null;

		this.noise?.stop();
		this.noise = null;
	};

	_onFileDrop = (e) => {
		e.preventDefault();

		const file = e.dataTransfer.files[0];
		const reader = new FileReader();
		if (!file) return;

		reader.onload = (e) => {
			this._loadRom(e.target.result);
		};

		reader.readAsArrayBuffer(file);
	};

	_onError = (err) => {
		console.error(err);

		this._stop();
		this._showNoise();
	};

	_ignore = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};
}
