const MUSIC_DIR = "music/";
const TRACKS = ["pl1sk3n.mp3", "m3m0r13s.mp3", "3muwh4t.mp3"];

class Music {
	constructor() {
		this._volume = 0.5;
		this._audio = new Audio("music/pl1sk3n.mp3");
		this._hasStarted = false;
	}

	get volume() {
		return this._volume;
	}

	set volume(value) {
		this._volume = value;
		this._audio.volume = value;
	}

	start() {
		if (this._hasStarted) return;

		this._audio.play();
		this._hasStarted = true;
	}
}

export default new Music();
