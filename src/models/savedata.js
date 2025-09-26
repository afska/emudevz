import filesystem, { Drive } from "../filesystem";
import { bus } from "../utils";

const KEY = "savedata";
const DEFAULT_KEY_MAP = () => ({
	1: {
		BUTTON_A: " ",
		BUTTON_B: "D",
		BUTTON_SELECT: "BACKSPACE",
		BUTTON_START: "ENTER",
		BUTTON_UP: "ARROWUP",
		BUTTON_DOWN: "ARROWDOWN",
		BUTTON_LEFT: "ARROWLEFT",
		BUTTON_RIGHT: "ARROWRIGHT",
	},
	2: {
		BUTTON_A: "M",
		BUTTON_B: "N",
		BUTTON_SELECT: "U",
		BUTTON_START: "O",
		BUTTON_UP: "I",
		BUTTON_DOWN: "K",
		BUTTON_LEFT: "J",
		BUTTON_RIGHT: "L",
	},
});
const INITIAL_STATE = () => ({
	version: 1,
	gameMode: "campaign",
	maxChapterNumber: 1,
	completedLevels: [],
	lastLevelId: "start",
	language: "en",
	chatSpeed: "slow",
	crtFilter: true,
	emulatorVolume: 0,
	musicVolume: 0.3,
	musicTrack: 0,
	musicSecond: 0,
	trackInfo: null,
	openFiles: [Drive.MAIN_FILE],
	selectedFile: Drive.MAIN_FILE,
	inputTypes: { 1: "keyboard", 2: "disconnected" }, // values: "keyboard" | "gamepad1" | "gamepad2" | "disconnected"
	keyboardMappings: DEFAULT_KEY_MAP(),
	freeModeSetings: {
		romExtension: ".gb",
		screenWidth: 240,
		screenHeight: 160,
	},
	emulatorSettings: {
		useCartridge: true,
		useCPU: true,
		usePPU: true,
		useAPU: true,
		useController: true,
		useConsole: true,
		useMappers: true,
		withHotReload: true,
		syncToVideo: false,
		audioBufferSize: 4096,
	},
	unlockedUnits: {
		useCartridge: false,
		useCPU: false,
		usePPU: false,
		useAPU: false,
		useController: false,
		useConsole: false,
		useMappers: false,
	},
	unlockedLetsPlayLevels: [],
});

export default {
	state: INITIAL_STATE(),
	reducers: {
		setGameMode(state, gameMode) {
			return { ...state, gameMode };
		},
		setMaxChapterNumber(state, maxChapterNumber) {
			return { ...state, maxChapterNumber };
		},
		addCompletedLevel(state, levelId) {
			return {
				...state,
				completedLevels: [
					...state.completedLevels,
					{ levelId, date: Date.now() },
				],
			};
		},
		undoCompletedLevel(state) {
			const { completedLevels } = state;

			return {
				...state,
				completedLevels: completedLevels.slice(0, completedLevels.length - 1),
			};
		},
		setLastLevelId(state, lastLevelId) {
			return {
				...state,
				lastLevelId,
			};
		},
		setLanguage(state, language) {
			return { ...state, language };
		},
		setChatSpeed(state, chatSpeed) {
			return { ...state, chatSpeed };
		},
		setCrtFilter(state, crtFilter) {
			return { ...state, crtFilter };
		},
		setEmulatorVolume(state, emulatorVolume) {
			return { ...state, emulatorVolume };
		},
		setMusicVolume(state, musicVolume) {
			return { ...state, musicVolume };
		},
		setMusicTrack(state, musicTrack) {
			return { ...state, musicTrack, musicSecond: 0 };
		},
		setMusicSecond(state, musicSecond) {
			return { ...state, musicSecond };
		},
		setTrackInfo(state, trackInfo) {
			return { ...state, trackInfo };
		},
		setOpenFiles(state, openFiles) {
			return { ...state, openFiles };
		},
		setSelectedFile(state, selectedFile) {
			return { ...state, selectedFile };
		},
		setEmulatorSettings(state, emulatorSettings) {
			return { ...state, emulatorSettings };
		},
		setFreeModeSetings(state, freeModeSetings) {
			return { ...state, freeModeSetings };
		},
		setInputTypes(state, inputTypes) {
			return { ...state, inputTypes };
		},
		setKeyboardMappings(state, keyboardMappings) {
			return { ...state, keyboardMappings };
		},
		setDefaultKeyboardMappings(state) {
			return {
				...state,
				keyboardMappings: DEFAULT_KEY_MAP(),
			};
		},
		setUnlockedUnits(state, unlockedUnits) {
			return { ...state, unlockedUnits };
		},
		unlockLetsPlayLevel(state, letsPlayLevelId) {
			return {
				...state,
				unlockedLetsPlayLevels: [
					...state.unlockedLetsPlayLevels,
					letsPlayLevelId,
				],
			};
		},
		_setKey(state, { key, value }) {
			return { ...state, [key]: value };
		},
		reset() {
			return INITIAL_STATE();
		},
	},
	effects: (_dispatch_) => {
		// eslint-disable-next-line
		const dispatch = _dispatch_[KEY];

		return {
			addCompletedLevelIfNeeded(currentLevelId, _state_) {
				const book = _state_.book.instance;

				if (!book.isFinished(currentLevelId))
					this.addCompletedLevel(currentLevelId);
			},
			advance(currentLevelId, _state_) {
				const book = _state_.book.instance;

				this.addCompletedLevelIfNeeded(currentLevelId);

				const nextLevelId = book.nextIdOf(currentLevelId);
				return this.advanceTo(nextLevelId);
			},
			advanceTo(nextLevelId, _state_) {
				const book = _state_.book.instance;

				if (!book.exists(nextLevelId)) return false;
				if (!book.isUnlocked(nextLevelId)) return false;

				this.unlockChapter(nextLevelId);

				_dispatch_.level.goTo(nextLevelId);
				return true;
			},
			unlockChapter(levelId, _state_) {
				const state = _state_[KEY];
				const book = _state_.book.instance;
				const chapter = book.getChapterOf(levelId);
				if (chapter.number > state.maxChapterNumber)
					dispatch.setMaxChapterNumber(chapter.number);
			},
			validate(levelId, _state_) {
				const state = _state_[KEY];
				const book = _state_.book.instance;

				for (let key in INITIAL_STATE()) {
					if (state[key] == null) {
						this._setKey({ key, value: INITIAL_STATE()[key] });
					}
				}

				if (levelId != null && !book.isUnlocked(levelId)) {
					const firstLevel = book.chapters[0].levels[0];
					_dispatch_.level.goToReplacing(firstLevel.id);
					return false;
				}

				return true;
			},
			openFile(filePath, _state_) {
				const state = _state_[KEY];
				const { openFiles } = state;

				try {
					if (!filesystem.exists(filePath)) return;
				} catch (e) {
					return;
				}

				const alreadyOpenFile = openFiles.find(
					(it) => filesystem.normalize(it) === filesystem.normalize(filePath)
				);

				if (alreadyOpenFile == null) {
					this.setOpenFiles([...openFiles, filePath]);
					this.setSelectedFile(filePath);
				} else {
					this.setSelectedFile(alreadyOpenFile);
				}
				bus.emit("file-opened");
			},
			closeFile(filePath, _state_) {
				const state = _state_[KEY];
				const { openFiles, selectedFile } = state;

				const normalizedFilePath = filesystem.normalize(filePath);

				const newOpenFiles = openFiles.filter((it) => {
					return filesystem.normalize(it) !== normalizedFilePath;
				});
				if (
					selectedFile != null &&
					filesystem.normalize(selectedFile) === normalizedFilePath
				)
					this.setSelectedFile(newOpenFiles[0]);
				this.setOpenFiles(newOpenFiles);
				bus.emit("file-closed");
			},
			closeNonExistingFiles(__, _state_) {
				const state = _state_[KEY];
				const { openFiles } = state;

				for (let openFile of openFiles) {
					if (!filesystem.exists(openFile)) this.closeFile(openFile);
				}
			},
			unlockUnit(name, _state_) {
				const state = _state_[KEY];

				this.setEmulatorSettings({ ...state.emulatorSettings, [name]: true });
				this.setUnlockedUnits({ ...state.unlockedUnits, [name]: true });
			},
		};
	},
};
