import store from "../../store";

const MUSIC_DIR = "music/";
const TRACKS = [];

class Music {
	constructor() {
		this._volume = 0.5;
		this._track = 0;
		this._audio = null;
		this._hasStarted = false;
	}

	setVolume(value) {
		this._volume = value;
		this._saveVolume();

		if (this._audio != null) {
			this._audio.volume = value;
		}
	}

	start() {
		if (this._hasStarted) return;

		this._volume = this._loadVolume();
		this._track = this._loadTrack();
		this._playCurrentTrack();
		this._hasStarted = true;
	}

	_playCurrentTrack() {
		this._audio = new Audio(MUSIC_DIR + TRACKS[this._track]);
		this._audio.play();
		this._audio.onended = () => {
			this._track = (this._track + 1) % TRACKS.length;
			this._saveTrack();
			this._playCurrentTrack();
		};
	}

	_loadVolume() {
		const value = store.getState().savedata.musicVolume;
		if (isFinite(value) && value >= 0 && value <= 1) return value;

		return 0.5;
	}

	_loadTrack() {
		const value = store.getState().savedata.musicTrack;
		if (isFinite(value) && value >= 0 && value < TRACKS.length) return value;

		return 0;
	}

	_saveVolume() {
		store.dispatch.savedata.setMusicVolume(this._volume);
	}

	_saveTrack() {
		store.dispatch.savedata.setMusicTrack(this._track);
	}
}

export default new Music();
