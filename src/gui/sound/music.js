import store from "../../store";
import { bus } from "../../utils";

const MUSIC_DIR = "music/";
const TRACKS = [
	{
		file: "01_10-detective-plisken.mp3",
		artist: "Synthenia",
		title: "Detective Plisken",
	},
	{ file: "02_15-reveng.mp3", artist: "Synthenia", title: "RevEng" },
	{ file: "03_05-memories.mp3", artist: "Synthenia", title: "Memories" },
	{
		file: "04_07-neural-emulation.mp3",
		artist: "Synthenia",
		title: "Neural Emulation",
	},
	{
		file: "05_04-unknown-opcode.mp3",
		artist: "Synthenia",
		title: "Unknown Opcode",
	},
	{ file: "06_14-lazer-idols.mp3", artist: "Synthenia", title: "Lazer Idols" },
	{ file: "07_17-water-level.mp3", artist: "Synthenia", title: "Water Level" },
	{
		file: "08_11-voltage-overload.mp3",
		artist: "Synthenia",
		title: "Voltage Overload",
	},
	{
		file: "09_02-bet-bits.mp3",
		artist: "Synthenia",
		title: "Bet Bits",
	},
	{
		file: "10_03-crumbling-cities.mp3",
		artist: "Synthenia",
		title: "Crumbling Cities",
	},
	{
		file: "11_20-there-is-a-lynx-in-the-shower.mp3",
		artist: "Synthenia",
		title: "There is a lynx in the shower",
	},
	{
		file: "12_01-hiding-is-futile.mp3",
		artist: "Synthenia",
		title: "Hiding Is Futile",
	},
	{
		file: "13_08-unexpected-mainframe-interaction.mp3",
		artist: "Synthenia",
		title: "Unexpected Mainframe Interaction",
	},
	{
		file: "14_09-burning.mp3",
		artist: "Synthenia",
		title: "Burning",
	},
	{
		file: "15_12-host.mp3",
		artist: "Synthenia",
		title: "H.O.S.T.",
	},
	{
		file: "16_13-burn-the-broadcaster.mp3",
		artist: "Synthenia",
		title: "Burn the Broadcaster",
	},
	{
		file: "17_06-victor-and-wounded.mp3",
		artist: "Synthenia",
		title: "Victor & Wounded",
	},
	{
		file: "18_18-beyond-0xffff.mp3",
		artist: "Synthenia",
		title: "Beyond $FFFF",
	},
	{
		file: "19_16-one-last-bugfix.mp3",
		artist: "Synthenia",
		title: "One Last Bugfix",
	},
	{
		file: "20_19-back-to-light.mp3",
		artist: "Synthenia",
		title: "Back to Light",
		skip: true,
	},
];

class Music {
	constructor() {
		this._volume = 0.5;
		this._track = 0;
		this._audio = null;
		this._hasStarted = false;
		this._forcedTrackIndex = null;
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

		this._track = this._forcedTrackIndex || (this._track + 1) % TRACKS.length;
		this._saveTrack();
		this._playCurrentTrack();
		if (this._forcedTrackIndex === null && TRACKS[this._track].skip)
			this.next();
	}

	previous() {
		if (this._audio) this._audio.pause();

		this._track =
			this._forcedTrackIndex ||
			(this._track - 1 + TRACKS.length) % TRACKS.length;
		this._saveTrack();
		this._playCurrentTrack();
		if (this._forcedTrackIndex === null && TRACKS[this._track].skip)
			this.previous();
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

	forceTrack(title) {
		const trackIndex = TRACKS.findIndex((it) => it.title === title);
		if (trackIndex === -1) return;

		this._forcedTrackIndex = trackIndex;
		if (this._track !== this._forcedTrackIndex) this.next();
	}

	removeForcedTrack() {
		this._forcedTrackIndex = null;
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
