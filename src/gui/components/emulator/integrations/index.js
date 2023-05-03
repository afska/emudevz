import Nalleland from "./Nalleland";
import Spacegulls from "./Spacegulls";

export default {
	Spacegulls,
	Nalleland,

	get(id) {
		return this[id] || (() => false);
	},
};
