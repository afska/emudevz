import { push, replace } from "connected-react-router";
import {
	SAVESTATE_KEY_PREFIX,
	SAVESTATE_RESET_COMMAND,
} from "../gui/components/emulator/Emulator";
import Book from "../level/Book";
import { analytics } from "../utils";

const KEY = "level";
const INITIAL_STATE = () => ({
	instance: null,
	isSettingsOpen: false,
	isChapterSelectOpen: false,
	isCreditsOpen: false,
});

export default {
	state: INITIAL_STATE(),
	reducers: {
		setLevel(state, instance) {
			return { ...state, instance };
		},
		setSettingsOpen(state, isSettingsOpen) {
			return { ...state, isSettingsOpen };
		},
		setChapterSelectOpen(state, isChapterSelectOpen) {
			return { ...state, isChapterSelectOpen };
		},
		setCreditsOpen(state, isCreditsOpen) {
			return { ...state, isCreditsOpen };
		},
		reset() {
			return INITIAL_STATE();
		},
	},
	effects: (_dispatch_) => {
		// eslint-disable-next-line
		const dispatch = _dispatch_[KEY];

		return {
			goToPrevious(levelId, _state_) {
				const book = _state_.book.instance;

				const previousLevelId = book.previousIdOf(levelId);
				return this.goTo(previousLevelId);
			},
			goToNext(levelId, _state_) {
				const book = _state_.book.instance;

				const nextLevelId = book.nextIdOf(levelId);
				return this.goTo(nextLevelId);
			},
			goTo(levelId, _state_) {
				const book = _state_.book.instance;
				if (book != null) {
					const levelDefinition = book.getLevelDefinitionOf(levelId);
					if (levelDefinition != null) {
						analytics.track("level", {
							id: levelDefinition.id,
							humanId: levelDefinition.humanId,
							globalId: levelDefinition.globalId,
							name: levelDefinition.name.en,
						});
					}
				}

				_dispatch_.savedata.setLastLevelId(levelId);
				let r = parseInt(window.location.href.split("?r=")[1] ?? 0) + 1;
				if (isNaN(r)) r = 1;
				_dispatch_(replace(`/levels/${levelId}?r=${r}`));
			},
			goToReplacing(levelId) {
				_dispatch_.savedata.setLastLevelId(levelId);
				let r = parseInt(window.location.href.split("?r=")[1] ?? 0) + 1;
				if (isNaN(r)) r = 1;
				_dispatch_(replace(`/levels/${levelId}?r=${r}`));
			},
			goToLastLevel(__, _state_) {
				if (
					_state_.savedata.lastLevelId === Book.FAQ_LEVEL ||
					_state_.savedata.lastLevelId === Book.FREE_MODE_LEVEL
				) {
					this.goTo(Book.START_LEVEL);
					return;
				}

				this.goTo(_state_.savedata.lastLevelId);
			},
			goHome() {
				this.reset();
				_dispatch_(push("/"));
			},
			resetProgress(__, _state_) {
				const state = _state_[KEY];

				_dispatch_.content.setCurrentLevelContent("");

				const id = state.instance.id;
				const book = _state_.book.instance;
				const chapter = book.getChapterOf(id);
				if (chapter.isSpecial) {
					const saveStateKey = SAVESTATE_KEY_PREFIX + id;
					localStorage.setItem(saveStateKey, SAVESTATE_RESET_COMMAND);
				}

				setTimeout(() => {
					this.goTo(state.instance.id);
				});
			},
		};
	},
};
