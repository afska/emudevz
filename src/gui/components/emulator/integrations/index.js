import DizzySheepDisaster from "./DizzySheepDisaster";
import JupiterScope2 from "./JupiterScope2";
import Nalleland from "./Nalleland";
import RavensGate from "./RavensGate";
import RoboNinjaClimb from "./RoboNinjaClimb";
import Spacegulls from "./Spacegulls";
import SuperTiltBro from "./SuperTiltBro";

export default {
	DizzySheepDisaster,
	JupiterScope2,
	Nalleland,
	RavensGate,
	RoboNinjaClimb,
	Spacegulls,
	SuperTiltBro,

	get(id) {
		return this[id] || (() => false);
	},
};
