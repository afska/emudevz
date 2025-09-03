import locales from "../../../../locales";
import { bus } from "../../../../utils";
import ProgressBar from "../../widgets/ProgressBar";
import Tooltip from "../../widgets/Tooltip";
import Integration from "./Integration";

export default class RoboNinjaClimb extends Integration {
	state = { percentage: 0, level: 0 };

	render() {
		const { percentage, level } = this.state;

		if (percentage === 100) {
			return (
				<div
					style={{ width: "100%", textAlign: "center", whiteSpace: "nowrap" }}
				>
					<span>🥋🥋🥋</span>
				</div>
			);
		}

		return (
			<Tooltip
				title={`${locales.get("integration_roboninjaclimb_level")} ${
					1 + level
				} / ${WIN_LEVEL}`}
			>
				<div style={{ paddingTop: 8, paddingBottom: 8, width: "50%" }}>
					<ProgressBar
						percentage={percentage}
						barFillColor="#3398dc"
						style={{ marginTop: 0 }}
					/>
				</div>
			</Tooltip>
		);
	}

	onFrame = () => {
		const neees = this.props.getNEEES();
		if (!neees) return;

		const level = neees.cpu.memory.read(0x0300);
		const percentage = (level / WIN_LEVEL) * 100;

		if (percentage === 100) {
			this._disconnectControllers(neees);
			bus.emit("roboninjaclimb-end");
		}

		this.setState({ percentage, level });
	};
}

const WIN_LEVEL = 5;
