const KEY = "savedata";
const INITIAL_STATE = () => ({
	level: 0,
});

export default {
	state: INITIAL_STATE(),
	reducers: {
		setLevel(state, level) {
			return { ...state, level };
		},
		reset() {
			return INITIAL_STATE();
		},
	},
	effects: (_dispatch_) => {
		// eslint-disable-next-line
		const dispatch = _dispatch_[KEY];

		return {};
	},
};
