import React from "react";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Integration from "./Integration";

export default class FromBelow extends Integration {
	state = { points: 0, victory: false };

	render() {
		const { points, victory } = this.state;

		const percentage = (points / HIGH_SCORE) * 100;

		return (
			<div style={{ width: "50%", textAlign: "center", whiteSpace: "nowrap" }}>
				{victory ? (
					<span>🧱🧱🧱</span>
				) : (
					<div>
						<span>
							🎯 <strong>{points}</strong>
						</span>
						<ProgressBar
							percentage={percentage}
							barFillColor="#3398dc"
							style={{ marginTop: 0 }}
						/>
					</div>
				)}
			</div>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const points =
			neees.cpu.memory.read(0x0080) | (neees.cpu.memory.read(0x0081) << 8);
		const victory = points > HIGH_SCORE;

		this.setState({ points, victory });

		if (victory) {
			this._disconnectControllers(neees);
			bus.emit("frombelow-end");
		}
	};
}

const HIGH_SCORE = 1234; // TODO: DEFINE and REPLACE in `en.yml` and `es.yml`
