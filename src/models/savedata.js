const KEY = "savedata";
const INITIAL_STATE = () => ({
	levelId: 0,
	language: "en",
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
		reset() {
			return INITIAL_STATE();
		},
	},
	effects: (_dispatch_) => {
		// eslint-disable-next-line
		const dispatch = _dispatch_[KEY];

		return {
			validate(levelId, _state_) {
				const state = _state_[KEY];

				if (levelId > state.levelId) {
					_dispatch_.level.goToReplacing(state.levelId);
					return false;
				}

				return true;
			},
		};
	},
};
