import _ from "lodash";
import filesystem, { Drive } from "../filesystem";
import store from "../store";
import { bus } from "../utils";
import {
	getDefaultConsoleTheme,
	getDefaultGlobalTheme,
	getDefaultLayoutBrightness,
	getDefaultTerminalAnsiTheme,
} from "./themes/theme";

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
		BUTTON_X: "Z",
		BUTTON_Y: "X",
		BUTTON_L: "Q",
		BUTTON_R: "E",
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
		BUTTON_X: "H",
		BUTTON_Y: "B",
		BUTTON_L: "7",
		BUTTON_R: "9",
	},
});

export const DEFAULT_KEY_BINDINGS = Object.freeze({
	paneNavigationUp: "ALT+ARROWUP",
	paneNavigationDown: "ALT+ARROWDOWN",
	paneNavigationLeft: "ALT+ARROWLEFT",
	paneNavigationRight: "ALT+ARROWRIGHT",
	runCode: "ALT+ENTER",
	fileSearch: "CTRL+P",
	closeFile: "CTRL+E",
	closeFileDesktop: "CTRL+W",
	nextTab: "CTRL+TAB",
	previousTab: "CTRL+SHIFT+TAB",
});

export const DEFAULT_ADVANCED_SETTINGS = JSON.stringify(
	{
		codeEditor: {
			lineNumbers: true,
			highlightActiveLineGutter: true,
			highlightSpecialChars: true,
			history: true,
			foldGutter: true,
			drawSelection: true,
			dropCursor: true,
			allowMultipleSelections: true,
			indentOnInput: true,
			syntaxHighlighting: true,
			bracketMatching: true,
			closeBrackets: true,
			autocompletion: true,
			rectangularSelection: true,
			crosshairCursor: true,
			highlightActiveLine: true,
			highlightSelectionMatches: true,
			closeBracketsKeymap: true,
			defaultKeymap: true,
			searchKeymap: true,
			historyKeymap: true,
			foldKeymap: true,
			completionKeymap: true,
			lintKeymap: true,
		},
		layout: {
			triple: {
				resizable: false,
			},
			preventReload: false,
		},
		chat: {
			instant: false,
		},
		audio: {
			playAudioTests: false,
		},
	},
	null,
	2
);

const INITIAL_STATE = () => ({
	version: 1,
	saveId: guid(),
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
	keyBindings: {},
	advancedSettings: DEFAULT_ADVANCED_SETTINGS,
	freeModeSetings: {
		romExtension: ".gb",
		screenWidth: 160,
		screenHeight: 144,
	},
	emulatorSettings: {
		useCartridge: true,
		useCPU: true,
		usePPU: true,
		useAPU: true,
		useController: true,
		useConsole: true,
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
	},
	unlockedLetsPlayLevels: [],

	// --- supporter pack ---
	editorTheme: "oneDark",
	consoleTheme: getDefaultConsoleTheme(),
	terminalAnsiTheme: getDefaultTerminalAnsiTheme(),
	globalTheme: getDefaultGlobalTheme(),
	imguiTheme: "classic",
	invertTransparentImages: false,
	layoutBrightness: getDefaultLayoutBrightness(),
	sfxVolume: 0.3,
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
		setKeyBindings(state, keyBindings) {
			return { ...state, keyBindings };
		},
		setDefaultKeyBindings(state) {
			return { ...state, keyBindings: {} };
		},
		setAdvancedSettings(state, advancedSettings) {
			return { ...state, advancedSettings };
		},
		setDefaultAdvancedSettings(state) {
			return { ...state, advancedSettings: DEFAULT_ADVANCED_SETTINGS };
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

		// --- supporter pack ---
		setEditorTheme(state, editorTheme) {
			return { ...state, editorTheme };
		},
		setConsoleTheme(state, consoleTheme) {
			return {
				...state,
				consoleTheme: { ...state.consoleTheme, ...consoleTheme },
			};
		},
		setTerminalAnsiTheme(state, terminalAnsiTheme) {
			return {
				...state,
				terminalAnsiTheme: { ...state.terminalAnsiTheme, ...terminalAnsiTheme },
			};
		},
		setGlobalTheme(state, globalTheme) {
			return {
				...state,
				globalTheme: { ...state.globalTheme, ...globalTheme },
			};
		},
		setInvertTransparentImages(state, invertTransparentImages) {
			return { ...state, invertTransparentImages };
		},
		setLayoutBrightness(state, layoutBrightness) {
			return {
				...state,
				layoutBrightness: {
					...state.layoutBrightness,
					...layoutBrightness,
				},
			};
		},
		setImguiTheme(state, imguiTheme) {
			return { ...state, imguiTheme };
		},
		setSfxVolume(state, sfxVolume) {
			return { ...state, sfxVolume };
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

				if (!_.isEmpty(levelId) && !book.isUnlocked(levelId)) {
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
					bus.emit("file-opened", { filePath });
				} else {
					this.setSelectedFile(alreadyOpenFile);
					bus.emit("file-opened", { filePath: alreadyOpenFile });
				}
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
				) {
					const currentIndex = _.findIndex(openFiles, (it) => {
						return filesystem.normalize(it) === normalizedFilePath;
					});

					if (currentIndex > -1) {
						if (currentIndex === openFiles.length - 1) {
							this.setSelectedFile(newOpenFiles[newOpenFiles.length - 1]);
						} else {
							this.setSelectedFile(newOpenFiles[currentIndex]);
						}
					} else {
						this.setSelectedFile(newOpenFiles[0]);
					}
				}

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

function guid() {
	const s4 = () =>
		Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.slice(-4);
	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function getAdvancedSetting(getter, defaultValue = false) {
	try {
		const advancedSettings = JSON.parse(
			store.getState().savedata?.advancedSettings
		);
		return (advancedSettings && getter(advancedSettings)) || defaultValue;
	} catch {
		return defaultValue;
	}
}
