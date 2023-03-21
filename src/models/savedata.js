import filesystem, { Drive } from "../filesystem";

const DEFAULT_FILE = Drive.MAIN_FILE;

const KEY = "savedata";
const INITIAL_STATE = () => ({
	levelId: 0,
	language: "en",
	musicVolume: 0.5,
	musicTrack: 0,
	openFiles: [DEFAULT_FILE],
	selectedFile: DEFAULT_FILE,
});

export default {
	state: INITIAL_STATE(),
	reducers: {
		setLevelId(state, levelId) {
			return { ...state, levelId };
		},
		setLanguage(state, language) {
			return { ...state, language };
		},
		setMusicVolume(state, musicVolume) {
			return { ...state, musicVolume };
		},
		setMusicTrack(state, musicTrack) {
			return { ...state, musicTrack };
		},
		setOpenFiles(state, openFiles) {
			return { ...state, openFiles };
		},
		setSelectedFile(state, selectedFile) {
			return { ...state, selectedFile };
		},
		reset() {
			return INITIAL_STATE();
		},
	},
	effects: (_dispatch_) => {
		// eslint-disable-next-line
		const dispatch = _dispatch_[KEY];

		return {
			advance(currentLevelId, _state_) {
				return this.advanceTo(currentLevelId + 1);
			},
			advanceTo(nextLevelId, _state_) {
				const state = _state_[KEY];
				const book = _state_.book.instance;

				if (nextLevelId > book.maxLevelId) return false;
				if (nextLevelId > state.levelId) dispatch.setLevelId(nextLevelId);

				_dispatch_.level.goTo(nextLevelId);
				return true;
			},
			validate(levelId, _state_) {
				const state = _state_[KEY];

				if (state.openFiles == null) {
					this.setOpenFiles([DEFAULT_FILE]);
					this.setSelectedFile(DEFAULT_FILE);
				}

				if (levelId > state.levelId) {
					_dispatch_.level.goToReplacing(state.levelId);
					return false;
				}

				return true;
			},

			openFile(filePath, _state_) {
				const state = _state_[KEY];
				const { openFiles } = state;

				if (!openFiles.includes(filePath))
					this.setOpenFiles([...openFiles, filePath]);
				this.setSelectedFile(filePath);
			},
			closeFile(filePath, _state_) {
				const state = _state_[KEY];
				const { openFiles, selectedFile } = state;

				const newOpenFiles = openFiles.filter((it) => it !== filePath);
				if (selectedFile === filePath) this.setSelectedFile(newOpenFiles[0]);
				this.setOpenFiles(newOpenFiles);
			},
			closeNonExistingFiles(__, _state_) {
				const state = _state_[KEY];
				const { openFiles } = state;

				for (let openFile of openFiles) {
					if (!filesystem.exists(openFile)) this.closeFile(openFile);
				}
			},
		};
	},
};
