import store from "../../store";
import { bus } from "../../utils";

const MUSIC_DIR = "music/";
const TRACKS = [
	{ file: "0-plisken.mp3", artist: "Synthenia", title: "Detective Plisken" },
	{ file: "1-reveng.mp3", artist: "Synthenia", title: "RevEng" },
	{ file: "2-memories.mp3", artist: "Synthenia", title: "Memories" },
	{ file: "3-neural.mp3", artist: "Synthenia", title: "Neural Emulation" },
	{ file: "4-unknown.mp3", artist: "Synthenia", title: "Unknown Opcode" },
	{ file: "5-lazer.mp3", artist: "Synthenia", title: "Lazer Idols" },
	{
		file: "6-lynx.mp3",
		artist: "Synthenia",
		title: "There is a lynx in the shower",
	},
	{ file: "7-ffff.mp3", artist: "Synthenia", title: "Beyond $FFFF" },
	{ file: "8-water.mp3", artist: "Synthenia", title: "Water Level" },
	{ file: "9-voltage.mp3", artist: "Synthenia", title: "Voltage Overload" },
];

class Music {
	constructor() {
		this._volume = 0.5;
		this._track = 0;
		this._audio = null;
		this._hasStarted = false;
	}

	setVolume(value) {
		bus.emit("music-volume-changed", value);

		this._volume = value;
		this._saveVolume();

		if (this._audio != null) {
			this._audio.volume = value;
		}
	}

	start() {
		if (this.isPaused) return;
		if (this._hasStarted) return;

		this._volume = this._loadVolume();
		this._track = this._loadTrack();
		const startSecond = this._loadSecond();
		this._playCurrentTrack(startSecond);
		this._hasStarted = true;
	}

	next() {
		if (this._audio) this._audio.pause();

		this._track = (this._track + 1) % TRACKS.length;
		this._saveTrack();
		this._playCurrentTrack();
	}

	previous() {
		if (this._audio) this._audio.pause();

		this._track = (this._track - 1 + TRACKS.length) % TRACKS.length;
		this._saveTrack();
		this._playCurrentTrack();
	}

	pause() {
		if (this._audio && !this.isPaused) this._audio.pause();
		this.isPaused = true;

		bus.emit("pause-music");
	}

	resume() {
		if (this._audio && this._audio.paused) this._audio.play();
		this.isPaused = false;

		bus.emit("resume-music");
	}

	getCurrentTime() {
		if (this._audio == null) return 0;

		const value = this._audio.currentTime || 0;
		return isFinite(value) && value >= 0 ? value : 0;
	}

	_playCurrentTrack(startSecond = 0) {
		this._saveTrackInfo();
		this._audio = new Audio(MUSIC_DIR + TRACKS[this._track].file);
		this._audio.volume = this._volume;

		if (startSecond > 0) {
			this._audio.addEventListener(
				"loadedmetadata",
				() => {
					this._audio.currentTime = startSecond;
				},
				{ once: true }
			);
		}

		this._audio.play();
		this._audio.onended = () => {
			this.next();
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

	_loadSecond() {
		const value = store.getState().savedata.musicSecond;
		if (isFinite(value) && value >= 0) return value;

		return 0;
	}

	_saveVolume() {
		store.dispatch.savedata.setMusicVolume(this._volume);
	}

	_saveTrack() {
		store.dispatch.savedata.setMusicTrack(this._track);
		this._saveTrackInfo();
	}

	_saveTrackInfo() {
		store.dispatch.savedata.setTrackInfo(TRACKS[this._track]);
	}
}

export default new Music();
