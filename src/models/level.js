import { push, replace } from "connected-react-router";
// import filesystem from "../filesystem"; // TODO: PROGRESS RESET
import { analytics } from "../utils";

const KEY = "level";
const INITIAL_STATE = () => ({
	instance: null,
	isSettingsOpen: false,
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
		reset() {
			return INITIAL_STATE();
		},
	},
	effects: (_dispatch_) => {
		// eslint-disable-next-line
		const dispatch = _dispatch_[KEY];

		return {
			goTo(levelId) {
				analytics.track("level", {
					id: levelId,
				});
				_dispatch_(push(`/levels/${levelId}?r=${Math.random()}`));
			},

			goToReplacing(levelId) {
				_dispatch_(replace(`/levels/${levelId}?r=${Math.random()}`));
			},

			goToLastUnlockedLevel(__, _state_) {
				const levelId = _state_.savedata.levelId;
				this.goTo(levelId);
			},

			goHome() {
				this.reset();
				_dispatch_(push("/"));
			},

			resetProgress(__, _state_) {
				// TODO: PROGRESS RESET
				/*
				const level = _state_[KEY].instance;

				if (level.memory.content.multifile) {
					const snapshot = `/.snapshots/level-${level.id - 1}`;
					if (!filesystem.exists(snapshot)) return;

					filesystem.rmrf("/code");
					filesystem.cpr(snapshot, "/code");
					filesystem.rmrf(snapshot);

					_dispatch_.savedata.setLevelId(level.id - 1);
					dispatch.goTo(level.id - 1);
				}

				_dispatch_.content.setCurrentLevelContent("");

				setTimeout(() => {
					const state = _state_[KEY];
					this.goTo(state.instance.id);
				});
				*/
			},
		};
	},
};
