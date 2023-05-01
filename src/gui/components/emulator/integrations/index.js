import Spacegulls from "./Spacegulls";

export default {
	Spacegulls,

	get(id) {
		return this[id] || (() => false);
	},
};
