import DizzySheepDisaster from "./DizzySheepDisaster";
import Falling from "./Falling";
import FelineFloodFiasco from "./FelineFloodFiasco";
import FromBelow from "./FromBelow";
import Heist from "./Heist";
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
	Falling,
	FelineFloodFiasco,
	FromBelow,
	JupiterScope2,
	Heist,
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
