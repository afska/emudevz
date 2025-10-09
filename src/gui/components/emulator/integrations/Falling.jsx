import locales from "../../../../locales";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Tooltip from "../../widgets/Tooltip";
import Integration from "./Integration";

export default class Falling extends Integration {
	state = { percentage: 0, points: 0, lives: 0 };

	render() {
		const { percentage, points, lives } = this.state;

		return (
			<Tooltip
				title={`${locales.get(
					"integration_falling_points"
				)} ${points} / ${HIGH_SCORE}`}
			>
				<div
					style={{ width: "50%", textAlign: "center", whiteSpace: "nowrap" }}
				>
					{percentage === 100 ? (
						<span>☁️☁️☁️</span>
					) : (
						<div>
							<span>
								💓 <strong>{lives}</strong>{" "}
								{locales.get("integration_falling_lives")}
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

		let points = neees.cpu.memory.read(0x001c);
		if (points > HIGH_SCORE) points = HIGH_SCORE;
		const lives = neees.cpu.memory.read(0x0201) & 0b1111;
		const percentage = (points / HIGH_SCORE) * 100;

		if (percentage === 100) {
			this._disconnectControllers(neees);
			bus.emit("falling-end");
		}

		this.setState({ percentage, points, lives });
	};
}

const HIGH_SCORE = 50;
