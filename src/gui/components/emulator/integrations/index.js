import DizzySheepDisaster from "./DizzySheepDisaster";
import JupiterScope2 from "./JupiterScope2";
import MinekartMadness from "./MinekartMadness";
import Nalleland from "./Nalleland";
import RavensGate from "./RavensGate";
import RoboNinjaClimb from "./RoboNinjaClimb";
import Spacegulls from "./Spacegulls";
import SuperTiltBro from "./SuperTiltBro";
import TeslaVsEdison from "./TeslaVsEdison";
import WolfSpirit from "./WolfSpirit";

export default {
	DizzySheepDisaster,
	JupiterScope2,
	MinekartMadness,
	Nalleland,
	RavensGate,
	RoboNinjaClimb,
	Spacegulls,
	SuperTiltBro,
	TeslaVsEdison,
	WolfSpirit,

	get(id) {
		return this[id] || (() => false);
	},
};
