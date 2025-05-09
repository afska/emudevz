import React from "react";
import locales from "../../../../locales";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Tooltip from "../../widgets/Tooltip";
import Integration from "./Integration";

export default class MinekartMadness extends Integration {
	state = { percentage: 0, wave: 0 };

	render() {
		const { percentage, wave } = this.state;

		return (
			<Tooltip
				title={`${locales.get("integration_heist_wave")} ${1 + wave} / ${
					1 + WIN_WAVE
				}`}
			>
				<div
					style={{ width: "50%", textAlign: "center", whiteSpace: "nowrap" }}
				>
					{percentage === 100 ? (
						<span>⛽⛽⛽</span>
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

		let wave = neees.cpu.memory.read(0x0025) + 1;
		const percentage = (wave / WIN_WAVE) * 100;

		if (percentage === 100) {
			this._disconnectControllers(neees);
			bus.emit("heist-end");
		}

		this.setState({ percentage, wave });
	};
}

const WIN_WAVE = 19;
