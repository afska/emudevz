import React from "react";
import locales from "../../../../locales";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Tooltip from "../../widgets/Tooltip";
import Integration from "./Integration";

export default class DizzySheepDisaster extends Integration {
	state = { percentage: 0, level: 0, deaths: 0 };

	render() {
		const { percentage, level, deaths } = this.state;

		return (
			<Tooltip
				title={`${locales.get(
					"integration_dizzysheepdisaster_level"
				)} ${level} / ${20}`}
			>
				<div
					style={{ width: "50%", textAlign: "center", whiteSpace: "nowrap" }}
				>
					{percentage === 100 ? (
						<span>🧲🧲🧲</span>
					) : (
						<div>
							<span>☠️ {deaths.toString().padStart(2, "0")}</span>
							<ProgressBar
								percentage={percentage}
								barFillColor="#3398dc"
								style={{ marginTop: 0 }}
							/>
						</div>
					)}
				</div>
			</Tooltip>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const level = this._humanHexToNumber(neees.cpu.memory.read(0x0059));
		const deaths = this._humanHexToNumber(neees.cpu.memory.read(0x005a));
		const percentage = (level / WIN_LEVEL) * 100;

		if (percentage === 100) {
			this._disconnectControllers(neees);
			bus.emit("dizzysheepdisaster-end");
		}

		this.setState({ percentage, level, deaths });
	};
}

const WIN_LEVEL = 20;
