const KEY = "level";
const INITIAL_STATE = () => ({
	data: null,
});

export default {
	state: INITIAL_STATE(),
	reducers: {
		setData(state, data) {
			return { ...state, data };
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
