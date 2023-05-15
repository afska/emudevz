import JupiterScope2 from "./JupiterScope2";
import Nalleland from "./Nalleland";
import RavensGate from "./RavensGate";
import RoboNinjaClimb from "./RoboNinjaClimb";
import Spacegulls from "./Spacegulls";
import SuperTiltBro from "./SuperTiltBro";

export default {
	Spacegulls,
	Nalleland,
	JupiterScope2,
	RavensGate,
	SuperTiltBro,
	RoboNinjaClimb,

	get(id) {
		return this[id] || (() => false);
	},
};
