const KEY = "files";
const INITIAL_STATE = () => ({
	levels: {},
});

export default {
	state: INITIAL_STATE(),
	reducers: {
		setLevelContent(state, { levelId, content }) {
			return { ...state, levels: { ...state.levels, [levelId]: content } };
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
