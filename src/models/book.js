const KEY = "book";
const INITIAL_STATE = () => ({
	instance: null,
});

export default {
	state: INITIAL_STATE(),
	reducers: {
		setBook(state, instance) {
			return { ...state, instance };
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
