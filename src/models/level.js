import { push } from "connected-react-router";

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
				_dispatch_(push(`/levels/${levelId}?r=${Math.random()}`));
			},

			goToLastUnlockedLevel(__, _state_) {
				const levelId = _state_.savedata.levelId;
				this.goTo(levelId);
			},

			goHome() {
				this.reset();
				_dispatch_(push("/"));
			},
		};
	},
};
