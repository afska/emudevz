import { push, replace } from "connected-react-router";
import _ from "lodash";
import filesystem from "../filesystem";
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
			goTo(levelId) {
				analytics.track("level", {
					id: levelId,
				});

				_dispatch_.savedata.setLastLevelId(levelId);
				_dispatch_(push(`/levels/${levelId}?r=${Math.random()}`));
			},
			goToReplacing(levelId) {
				_dispatch_.savedata.setLastLevelId(levelId);
				_dispatch_(replace(`/levels/${levelId}?r=${Math.random()}`));
			},
			goToLastLevel(__, _state_) {
				this.goTo(_state_.savedata.lastLevelId);
			},
			goHome() {
				this.reset();
				_dispatch_(push("/"));
			},
			resetProgress(__, _state_) {
				_dispatch_.content.setCurrentLevelContent("");

				setTimeout(() => {
					const state = _state_[KEY];
					this.goTo(state.instance.id);
				});
			},
			rollback(__, _state_) {
				const snapshots = _state_.savedata.snapshots;
				const lastSnapshot = _.last(snapshots);

				const snapshot = `/.snapshots/level-${lastSnapshot}`;
				if (!filesystem.exists(snapshot)) return;

				filesystem.rmrf("/code");
				filesystem.cpr(snapshot, "/code");
				filesystem.rmrf(snapshot);

				_dispatch_.savedata.removeCompletedLevelAndSnapshot(lastSnapshot);
				dispatch.goTo(lastSnapshot);
			},
		};
	},
};
