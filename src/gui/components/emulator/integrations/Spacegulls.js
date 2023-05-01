import React from "react";
import ProgressBar from "../../widgets/ProgressBar";
import Integration from "./Integration";

export default class Spacegulls extends Integration {
	state = { percentage: 0 };

	render() {
		const { percentage } = this.state;

		return (
			<ProgressBar
				percentage={percentage}
				barFillColor="#3398dc"
				style={{ marginTop: 0, width: "50%" }}
			/>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const zone = neees.cpu.memory.readAt(0x0477);
		const zoneIndex = ZONES.indexOf(zone);
		if (zoneIndex >= 0) {
			const percentage = (zoneIndex / (ZONES.length - 1)) * 100;
			this.setState({ percentage });
		}
	};
}

const ZONES = [
	40,
	245,
	246,
	10,
	11,
	247,
	248,
	249,
	250,
	251,
	231,
	230,
	229,
	209,
	208,
	207,
	228,
	227,
	226,
	225,
	224,
	223,
	203,
	204,
	202,
	201,
	181,
	182,
	162,
	161,
	163,
	164,
	184,
	185,
	186,
	187,
	167,
	166,
	188,
	189,
	190,
	191,
	192,
	193,
	173,
	172,
	171,
	170,
	169,
	168,
	148,
	149,
	147,
	146,
	126,
	106,
	107,
	108,
	109,
	129,
	150,
	151,
	152,
	132,
	133,
	134,
	153,
	154,
	174,
	194,
	195,
	196,
	176,
	156,
	136,
	116,
	115,
	114,
	113,
	112,
	111,
	131,
	130,
	110,
	90,
	70,
	50,
	30,
	12,
	13,
	33,
	53,
];
