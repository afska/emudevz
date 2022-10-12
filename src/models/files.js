import { createTransform } from "redux-persist";
import _ from "lodash";

const KEY = "files";
const KEY_PREFIX = "persist:emudevz:level-";
const INITIAL_STATE = () => ({
	levels: {},
	filesystem: {
		path: "/",
		parent: null,
		isReadOnly: true,
		isDirectory: true,
		children: [],
	},
});

export const transform = createTransform(
	(inboundState) => {
		return {
			...inboundState,
			levels: _.mapValues(inboundState.levels, (levelContent, id) => {
				const localStorageKey = KEY_PREFIX + id;
				localStorage.setItem(localStorageKey, levelContent);
				return localStorageKey;
			}),
		};
	},
	(outboundState) => {
		return {
			...outboundState,
			levels: _.mapValues(outboundState.levels, (localStorageKey) => {
				return localStorage.getItem(localStorageKey);
			}),
		};
	},
	{ whitelist: [KEY] }
);

export default {
	state: INITIAL_STATE(),
	reducers: {
		setLevelContent(state, { levelId, content }) {
			return { ...state, levels: { ...state.levels, [levelId]: content } };
		},
		setFilesystem(state, filesystem) {
			return { ...state, filesystem };
		},
		reset() {
			return INITIAL_STATE();
		},
	},
	effects: (_dispatch_) => {
		// eslint-disable-next-line
		const dispatch = _dispatch_[KEY];

		return {
			setCurrentLevelContent(content, _state_) {
				this.setLevelContent({ levelId: _state_.level.instance.id, content });
			},
		};
	},
};
