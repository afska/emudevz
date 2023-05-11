import JupiterScope2 from "./JupiterScope2";
import Nalleland from "./Nalleland";
import RavensGate from "./RavensGate";
import Spacegulls from "./Spacegulls";

export default {
	Spacegulls,
	Nalleland,
	JupiterScope2,
	RavensGate,

	get(id) {
		return this[id] || (() => false);
	},
};
