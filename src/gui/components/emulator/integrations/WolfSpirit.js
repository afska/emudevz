import React from "react";
import locales from "../../../../locales";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Tooltip from "../../widgets/Tooltip";
import Integration from "./Integration";

export default class WolfSpirit extends Integration {
	state = { percentage: 0, level: 0, lives: 0 };

	render() {
		const { percentage, level, lives } = this.state;

		return (
			<Tooltip
				title={`${locales.get(
					"integration_wolfspirit_level"
				)} ${level} / ${10}`}
			>
				<div
					style={{ width: "50%", textAlign: "center", whiteSpace: "nowrap" }}
				>
					{percentage === 100 ? (
						<span>🐺🐺🐺</span>
					) : (
						<div>
							<span>
								💓 <strong>{lives}</strong>{" "}
								{locales.get("integration_wolfspirit_lives")}
							</span>
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

		const level = neees.cpu.memory.read(0x0090) + 1;
		const lives = neees.cpu.memory.read(0x00a6);
		const percentage = (level / WIN_LEVEL) * 100;

		if (percentage === 100) {
			this._disconnectControllers(neees);
			bus.emit("wolfspirit-end");
		}

		this.setState({ percentage, level, lives });
	};
}

const WIN_LEVEL = 10;
