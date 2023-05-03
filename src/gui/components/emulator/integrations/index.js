import JupiterScope2 from "./JupiterScope2";
import Nalleland from "./Nalleland";
import Spacegulls from "./Spacegulls";

export default {
	Spacegulls,
	Nalleland,
	JupiterScope2,

	get(id) {
		return this[id] || (() => false);
	},
};
