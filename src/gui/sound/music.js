const MUSIC_DIR = "music/";
const TRACKS = ["pl1sk3n.mp3", "m3m0r13s.mp3", "3muwh4t.mp3"];
const STORAGE_KEY = "volume";

class Music {
	constructor() {
		this._volume = this._loadVolume();
		this._audio = new Audio(""); //"music/pl1sk3n.mp3");
		this._hasStarted = false;
	}

	get volume() {
		return this._volume;
	}

	set volume(value) {
		this._volume = value;
		this._saveVolume();

		this._audio.volume = value;
	}

	start() {
		if (this._hasStarted) return;

		this._audio.play();
		this._hasStarted = true;
	}

	_loadVolume() {
		const value = parseFloat(localStorage.getItem(STORAGE_KEY));
		if (isFinite(value) && value >= 0 && value <= 1) return value;

		return 0.5;
	}

	_saveVolume() {
		localStorage.setItem(STORAGE_KEY, this._volume);
	}
}

export default new Music();
