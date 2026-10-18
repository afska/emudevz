import { getPersistor } from "@rematch/persist";
import { push, replace } from "connected-react-router";
import {
	SAVESTATE_KEY_PREFIX,
	SAVESTATE_RESET_COMMAND,
} from "../gui/components/emulator/Emulator";
import { music } from "../gui/sound";
import Book from "../level/Book";
import Level from "../level/Level";
import { analytics } from "../utils";
import { getAdvancedSetting } from "./savedata";

const KEY = "level";
const INITIAL_STATE = () => ({
	instance: null,
	isSettingsOpen: false,
	isChapterSelectOpen: false,
	isCreditsOpen: false,
});

async function navigate(_dispatch_, path, go = push) {
	music.saveSecond();

	let r = parseInt(window.location.href.split("?r=")[1] ?? 0) + 1;
	if (isNaN(r)) r = 1;

	// HACK: Sometimes, we need to reload the full page
	// the game evaluates player code by using `moduleEval.js`,
	// which calls `eval(...)`, incorporating their code into EmuDevz's code
	// this has two downsides:
	// - if the player code enters an infinite loop, the game could freeze
	// - the codebase gets bigger on each run, harming performance and effectively leaking memory
	// since code evaluation cannot be undone, the only solution would be to run player code inside a WebWorker
	// but that would make debugging harder, and it'd be a huge architectural change, so I'm trying to avoid that
	// as a cheap but effective hack, we'll force a full page reload if the user has run the emulator
	if (window.EmuDevz.state.didRunEmulator && !shouldPreventReload()) {
		// wait until any pending writes are flushed
		Level.startEffect("running", { sfx: false });
		try {
			// rematch-persist
			const persistor = getPersistor();
			await persistor.flush();

			// browserfs
			await waitUntilBrowserFsAsyncMirrorIsIdle();
		} finally {
			Level.stopEffect();
		}

		// hard-navigate
		const base = window.location.pathname.replace(/\/[^/]*$/, "/");
		history.replaceState(null, "", `${base}#${path}?r=${r}`);
		window.location.reload();
	} else {
		_dispatch_(go(`${path}?r=${r}`));
	}
}

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

				window.EmuDevz.resetState();
				_dispatch_.savedata.setLastLevelId(levelId);
				navigate(_dispatch_, `/levels/${levelId}`);
			},
			goToReplacing(levelId) {
				window.EmuDevz.resetState();
				_dispatch_.savedata.setLastLevelId(levelId);

				navigate(_dispatch_, `/levels/${levelId}`, replace);
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
				navigate(_dispatch_, "/");
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

function shouldPreventReload() {
	return getAdvancedSetting((obj) => obj.general?.preventReload);
}

function waitUntilBrowserFsAsyncMirrorIsIdle() {
	return new Promise((resolve) => {
		const check = () => {
			if (!window.FS?.isBusy()) {
				resolve();
				return;
			}

			requestAnimationFrame(check);
		};

		check();
	});
}
