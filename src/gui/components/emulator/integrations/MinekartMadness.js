import React from "react";
import locales from "../../../../locales";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Tooltip from "../../widgets/Tooltip";
import Integration from "./Integration";

export default class MinekartMadness extends Integration {
	state = { percentage: 0, level: 0 };

	render() {
		const { percentage, level } = this.state;

		return (
			<Tooltip
				title={`${locales.get(
					"integration_minekartmadness_level"
				)} ${level} / ${WIN_LEVEL - 1}`}
			>
				<div
					style={{ width: "50%", textAlign: "center", whiteSpace: "nowrap" }}
				>
					{percentage === 100 ? (
						<span>💎💎💎</span>
					) : (
						<div>
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

		const level = neees.cpu.memory.read(0x0486) + 1;
		const percentage = ((level - 1) / (WIN_LEVEL - 1)) * 100;

		if (percentage === 100) {
			this._disconnectControllers(neees);
			bus.emit("minekartmadness-end");
		}

		this.setState({ percentage, level });
	};
}

const WIN_LEVEL = 5;
