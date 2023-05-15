import JupiterScope2 from "./JupiterScope2";
import Nalleland from "./Nalleland";
import RavensGate from "./RavensGate";
import Spacegulls from "./Spacegulls";
import SuperTiltBro from "./SuperTiltBro";

export default {
	Spacegulls,
	Nalleland,
	JupiterScope2,
	RavensGate,
	SuperTiltBro,

	get(id) {
		return this[id] || (() => false);
	},
};
