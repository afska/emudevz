import React from "react";
import locales from "../../../../locales";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Integration from "./Integration";

export default class JupiterScope2 extends Integration {
	state = { difficulty: 1, points: 0, victory: false };

	render() {
		const { difficulty, points, victory } = this.state;

		const percentage = (points / HIGH_SCORE) * 100;

		return (
			<div style={{ width: "50%", textAlign: "center", whiteSpace: "nowrap" }}>
				{victory ? (
					<span>🏆🏆🏆</span>
				) : difficulty >= MIN_DIFFICULTY ? (
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
				) : (
					<span>
						❌ {locales.get("integration_jupiterscope2_wrong_difficulty")}
					</span>
				)}
			</div>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const difficulty = neees.cpu.memory.read(0x07f8);
		const digit1 = neees.cpu.memory.read(0x0303);
		const digit2 = neees.cpu.memory.read(0x0304);
		const digit3 = neees.cpu.memory.read(0x0305);
		const digit4 = neees.cpu.memory.read(0x0306);
		const digit5 = neees.cpu.memory.read(0x0307);
		const digit6 = neees.cpu.memory.read(0x0308);
		const points =
			digit1 * 100000 +
			digit2 * 10000 +
			digit3 * 1000 +
			digit4 * 100 +
			digit5 * 10 +
			digit6 * 1;
		const victory = difficulty >= MIN_DIFFICULTY && points > HIGH_SCORE;

		this.setState({ difficulty, points, victory });

		if (victory) {
			this._disconnectControllers(neees);
			bus.emit("jupiterscope2-end");
		}
	};
}

const MIN_DIFFICULTY = 1;
const HIGH_SCORE = 10000;
